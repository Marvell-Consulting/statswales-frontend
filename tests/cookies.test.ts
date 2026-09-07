import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import cookieParser from 'cookie-parser';

import { cookies } from '../src/shared/routes/cookies';
import sessionMiddleware from '../src/shared/middleware/session';
import { publicCsrfToken } from '../src/shared/middleware/csrf-cookie';
import { localeUrl } from '../src/shared/middleware/language-switcher';
import { Locale } from '../src/shared/enums/locale';
import { RequestHistory } from '../src/shared/interfaces/request-history';

// mounts only the pieces the cookies router needs, with res.locals.history seeded directly - this
// simulates a malicious entry having ended up in session history by any means (a live exploit, a bug
// elsewhere, or a session created before this fix shipped) so we can prove the redirect sink itself is
// safe regardless of how the history got there
const buildHarness = (seedHistory: RequestHistory[]) => {
  const app = express();
  app.use(cookieParser());
  app.use(sessionMiddleware);
  app.use(publicCsrfToken);
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.language = Locale.EnglishGb;
    req.buildUrl = localeUrl;
    next();
  });
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.locals.history = seedHistory;
    next();
  });
  // stub out the view engine - we only need to see what locals the route would have rendered with
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.render = ((view: string, locals?: object) => res.json({ view, locals })) as Response['render'];
    next();
  });
  app.use('/en-GB/cookies', cookies);
  return app;
};

const entry = (url: string): RequestHistory => ({ url, timestamp: new Date().toISOString(), method: 'GET' });

const extractCookieValue = (res: request.Response, name: string): string => {
  const raw = res.headers['set-cookie'];
  const setCookie = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : [];
  const line = setCookie.find((c) => c.startsWith(`${name}=`));
  if (!line) throw new Error(`${name} cookie was not set`);
  // take everything up to the first ";" rather than splitting on "=", so a value that itself
  // contains "=" (e.g. base64 padding) isn't truncated
  return line.split(';')[0].slice(name.length + 1);
};

// primes the double-submit CSRF cookie via a GET, as a real browser would before submitting
// either the cookie banner or the settings form
const primeCsrfToken = async (agent: ReturnType<typeof request.agent>): Promise<string> => {
  const res = await agent.get('/en-GB/cookies');
  return extractCookieValue(res, '_csrf');
};

describe('POST /cookies (accept all)', () => {
  test('redirects back to a normal /en-GB/... referrer', async () => {
    const app = buildHarness([entry('/en-GB/some-page')]);
    const agent = request.agent(app);
    const csrfToken = await primeCsrfToken(agent);

    const res = await agent.post('/en-GB/cookies').type('form').send({ acceptAll: 'true', _csrf: csrfToken });

    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/en-GB/some-page');
  });

  test('does not redirect to a protocol-relative referrer, falls back to /cookies', async () => {
    const app = buildHarness([entry('//evil.com/x')]);
    const agent = request.agent(app);
    const csrfToken = await primeCsrfToken(agent);

    const res = await agent.post('/en-GB/cookies').type('form').send({ acceptAll: 'true', _csrf: csrfToken });

    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/en-GB/cookies');
  });

  test('does not redirect to a backslash-obfuscated referrer, falls back to /cookies', async () => {
    const app = buildHarness([entry('/\\evil.com')]);
    const agent = request.agent(app);
    const csrfToken = await primeCsrfToken(agent);

    const res = await agent.post('/en-GB/cookies').type('form').send({ acceptAll: 'true', _csrf: csrfToken });

    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/en-GB/cookies');
  });

  test('falls back to /cookies when there is no history at all', async () => {
    const app = buildHarness([]);
    const agent = request.agent(app);
    const csrfToken = await primeCsrfToken(agent);

    const res = await agent.post('/en-GB/cookies').type('form').send({ acceptAll: 'true', _csrf: csrfToken });

    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/en-GB/cookies');
  });

  test('redirects back to a locale-root referrer with a query string', async () => {
    const app = buildHarness([entry('/en-GB?feature=x')]);
    const agent = request.agent(app);
    const csrfToken = await primeCsrfToken(agent);

    const res = await agent.post('/en-GB/cookies').type('form').send({ acceptAll: 'true', _csrf: csrfToken });

    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/en-GB?feature=x');
  });

  test('rejects a POST with no CSRF token, as a cross-site attacker page could send', async () => {
    const app = buildHarness([entry('/en-GB/some-page')]);
    const agent = request.agent(app);
    await primeCsrfToken(agent);

    const res = await agent.post('/en-GB/cookies').type('form').send({ acceptAll: 'true' });

    expect(res.status).toBe(403);
  });

  test('rejects a POST with a CSRF token that does not match the cookie', async () => {
    const app = buildHarness([entry('/en-GB/some-page')]);
    const agent = request.agent(app);
    await primeCsrfToken(agent);

    const res = await agent
      .post('/en-GB/cookies')
      .type('form')
      .send({ acceptAll: 'true', _csrf: 'guessed-or-stale-token' });

    expect(res.status).toBe(403);
  });
});

describe('GET /cookies', () => {
  test('passes a normal /en-GB/... referrer through to the rendered page', async () => {
    const app = buildHarness([entry('/en-GB/some-page')]);

    const res = await request(app).get('/en-GB/cookies');

    expect(res.body.locals.referrer).toBe('/en-GB/some-page');
  });

  test('does not pass a protocol-relative referrer to the rendered page, falls back to /cookies', async () => {
    const app = buildHarness([entry('//evil.com/x')]);

    const res = await request(app).get('/en-GB/cookies');

    expect(res.body.locals.referrer).toBe('/en-GB/cookies');
  });

  test('does not pass a backslash-obfuscated referrer to the rendered page, falls back to /cookies', async () => {
    const app = buildHarness([entry('/\\evil.com')]);

    const res = await request(app).get('/en-GB/cookies');

    expect(res.body.locals.referrer).toBe('/en-GB/cookies');
  });
});
