import express from 'express';
import request from 'supertest';
import helmet from 'helmet';

import { buildCspDirectives, generateNonce, strictTransport } from '../src/shared/middleware/strict-transport';

describe('buildCspDirectives', () => {
  const directives = buildCspDirectives();

  it('does not allow unsafe-inline scripts', () => {
    const scriptSrc = directives.scriptSrc as string[];
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it('does not override default-src, leaving Helmet to supply its self default', () => {
    expect(directives.defaultSrc).toBeUndefined();
  });

  it('allow-lists Google Tag Manager for scripts', () => {
    const scriptSrc = directives.scriptSrc as string[];
    expect(scriptSrc).toContain('https://www.googletagmanager.com');
  });

  it('allow-lists the Fira Code stylesheet', () => {
    const styleSrc = directives.styleSrc as string[];
    expect(styleSrc).toContain('https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/fira_code.min.css');
  });

  it('allow-lists Google Analytics/DoubleClick beacon endpoints for connect-src and img-src', () => {
    const connectSrc = directives.connectSrc as string[];
    const imgSrc = directives.imgSrc as string[];

    // gtag.js sends hits from region-pinned subdomains (e.g. region1.google-analytics.com), not
    // just the bare www host, so these must be wildcarded rather than pinned to a literal origin.
    expect(connectSrc).toContain('https://*.google-analytics.com');
    expect(connectSrc).toContain('https://*.analytics.google.com');
    expect(connectSrc).toContain('https://stats.g.doubleclick.net');
    expect(imgSrc).toContain('https://*.google-analytics.com');
    expect(imgSrc).toContain('https://stats.g.doubleclick.net');
  });

  it('threads a nonce function through script-src for inline SSR scripts', () => {
    const scriptSrc = directives.scriptSrc as Array<string | ((...args: unknown[]) => string)>;
    const nonceFn = scriptSrc.find((entry) => typeof entry === 'function');
    expect(nonceFn).toBeDefined();

    const res = { locals: { cspNonce: 'abc123' } };
    expect((nonceFn as (req: unknown, res: unknown) => string)({}, res)).toBe("'nonce-abc123'");
  });
});

describe('generateNonce', () => {
  it('sets a base64 nonce on res.locals', () => {
    const res = { locals: {} as { cspNonce?: string } };
    const next = jest.fn();

    generateNonce({} as express.Request, res as unknown as express.Response, next);

    expect(res.locals.cspNonce).toEqual(expect.any(String));
    expect(res.locals.cspNonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(next).toHaveBeenCalledWith();
  });

  it('generates a different nonce for every request', () => {
    const resA = { locals: {} as { cspNonce?: string } };
    const resB = { locals: {} as { cspNonce?: string } };

    generateNonce({} as express.Request, resA as unknown as express.Response, jest.fn());
    generateNonce({} as express.Request, resB as unknown as express.Response, jest.fn());

    expect(resA.locals.cspNonce).not.toEqual(resB.locals.cspNonce);
  });
});

describe('CSP header produced by buildCspDirectives()', () => {
  const buildTestApp = () => {
    const app = express();
    app.use(generateNonce);
    app.use(helmet.contentSecurityPolicy({ directives: buildCspDirectives() }));
    app.get('/', (req, res) => res.send('ok'));
    return app;
  };

  it('does not allow unsafe-inline scripts', async () => {
    const res = await request(buildTestApp()).get('/');
    const csp = res.headers['content-security-policy'];

    expect(csp).toBeDefined();
    const scriptSrc = csp.split(';').find((directive: string) => directive.trim().startsWith('script-src '));
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it('sets default-src to self', async () => {
    const res = await request(buildTestApp()).get('/');
    expect(res.headers['content-security-policy']).toMatch(/default-src 'self'(;|$)/);
  });

  it('sets object-src none, base-uri self and form-action self', async () => {
    const res = await request(buildTestApp()).get('/');
    const csp = res.headers['content-security-policy'];

    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it('includes a per-request nonce in script-src', async () => {
    const res = await request(buildTestApp()).get('/');
    const csp = res.headers['content-security-policy'];

    expect(csp).toMatch(/script-src[^;]*'nonce-[A-Za-z0-9+/]+=*'/);
  });

  it('allow-lists Google Analytics/DoubleClick for connect-src and img-src', async () => {
    const res = await request(buildTestApp()).get('/');
    const csp = res.headers['content-security-policy'];

    const connectSrc = csp.split(';').find((directive: string) => directive.trim().startsWith('connect-src '));
    const imgSrc = csp.split(';').find((directive: string) => directive.trim().startsWith('img-src '));

    expect(connectSrc).toContain('https://*.google-analytics.com');
    expect(connectSrc).toContain('https://*.analytics.google.com');
    expect(connectSrc).toContain('https://stats.g.doubleclick.net');
    expect(imgSrc).toContain('https://*.google-analytics.com');
    expect(imgSrc).toContain('https://stats.g.doubleclick.net');
  });
});

describe('strictTransport (as wired up for the current AppEnv)', () => {
  // tests run with APP_ENV=ci (see tests/.jest/set-env-vars.ts), where HSTS/CSP headers are
  // intentionally skipped for local dev ergonomics - but the nonce must still always be set so
  // views never render `nonce="undefined"` should the env check ever change.
  it('always makes a cspNonce available to views, even when CSP headers are skipped', async () => {
    const app = express();
    app.use(strictTransport);
    app.get('/', (req, res) => res.send(res.locals.cspNonce));

    const res = await request(app).get('/');

    expect(res.text).toEqual(expect.any(String));
    expect(res.text.length).toBeGreaterThan(0);
  });
});
