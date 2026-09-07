import request from 'supertest';

import app from '../src/consumer/app';

const extractCsrfToken = (html: string): string => {
  const inputMatch = html.match(/<input\b[^>]*\bname="_csrf"[^>]*>/);
  const valueMatch = inputMatch?.[0].match(/\bvalue="([^"]*)"/);
  if (!valueMatch) throw new Error('Could not find CSRF token in rendered page');
  return valueMatch[1];
};

describe('CSRF protection on public/anonymous state-changing routes (double-submit cookie)', () => {
  const makeAgent = () => request.agent(app);

  describe('POST /cookies', () => {
    test('rejects a POST with no CSRF token, as a cross-site attacker page could send', async () => {
      const agent = makeAgent();
      await agent.get('/en-GB/cookies');

      const res = await agent.post('/en-GB/cookies').type('form').send({ acceptAll: 'true' });

      expect(res.status).toBe(403);
    });

    test('rejects a POST with a CSRF token that does not match the cookie', async () => {
      const agent = makeAgent();
      await agent.get('/en-GB/cookies');

      const res = await agent
        .post('/en-GB/cookies')
        .type('form')
        .send({ acceptAll: 'true', _csrf: 'guessed-or-stale-token' });

      expect(res.status).toBe(403);
    });

    test('accepts a same-site POST that includes the CSRF token rendered into the cookie settings form', async () => {
      const agent = makeAgent();
      const formPage = await agent.get('/en-GB/cookies');
      const csrfToken = extractCsrfToken(formPage.text);

      const res = await agent.post('/en-GB/cookies').type('form').send({ measuring: 'accept', _csrf: csrfToken });

      expect(res.status).toBe(302);
    });

    test('accepts a same-site POST that includes the CSRF token rendered into the cookie banner form', async () => {
      const agent = makeAgent();
      // the cookie banner form (rendered on every page via the shared Layout) carries its own
      // "_csrf" field alongside the settings form's - both share the same double-submit cookie
      const formPage = await agent.get('/en-GB/cookies');
      const bannerFieldMatch = formPage.text.match(/<form id="cookie-banner-form"[\s\S]*?<\/form>/);
      const csrfToken = extractCsrfToken(bannerFieldMatch?.[0] ?? '');

      const res = await agent.post('/en-GB/cookies').type('form').send({ acceptAll: 'true', _csrf: csrfToken });

      expect(res.status).toBe(302);
    });
  });

  describe('POST /feedback', () => {
    test('rejects a POST with no CSRF token, as a cross-site attacker page could send', async () => {
      const agent = makeAgent();
      await agent.get('/en-GB/feedback');

      const res = await agent
        .post('/en-GB/feedback')
        .type('form')
        .send({ satisfaction: 'very_satisfied', improve: 'nothing' });

      expect(res.status).toBe(403);
    });

    test('accepts a same-site POST that includes the CSRF token rendered into the form', async () => {
      const agent = makeAgent();
      const formPage = await agent.get('/en-GB/feedback');
      const csrfToken = extractCsrfToken(formPage.text);

      const res = await agent
        .post('/en-GB/feedback')
        .type('form')
        .send({ satisfaction: 'very_satisfied', improve: 'nothing', _csrf: csrfToken });

      expect(res.status).toBe(302);
    });
  });
});
