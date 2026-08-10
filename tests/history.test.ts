import express from 'express';
import request from 'supertest';

import { history, isRelativeUrl } from '../src/shared/middleware/history';
import sessionMiddleware from '../src/shared/middleware/session';

describe('isRelativeUrl', () => {
  test.each([
    ['//evil.com/x', false],
    ['/\\evil.com', false],
    ['/\\\\evil.com', false],
    ['https://evil.com', false],
    ['http://evil.com/x', false],
    ['/%2F%2Fevil.com', false],
    ['/%2f%2fevil.com', false],
    ['/%5Cevil.com', false],
    ['/%5cevil.com', false],
    ['/%', false],
    ['/en-GB/some-page', true],
    ['/cy-GB/rhyw-dudalen', true],
    ['/', true]
  ])('isRelativeUrl(%s) returns %s', (url, expected) => {
    expect(isRelativeUrl(url)).toBe(expected);
  });
});

describe('history middleware', () => {
  const buildHarness = () => {
    const app = express();
    app.use(sessionMiddleware);
    app.use(history);
    app.get('/{*splat}', (req, res) => res.json({ history: req.session.history }));
    return app;
  };

  test('does not record a protocol-relative URL in session history', async () => {
    const agent = request.agent(buildHarness());
    const res = await agent.get('//evil.com/x');
    expect(res.body.history).toEqual([]);
  });

  test('does not record a backslash-obfuscated URL in session history', async () => {
    const agent = request.agent(buildHarness());
    const res = await agent.get('/\\evil.com');
    expect(res.body.history).toEqual([]);
  });

  test('records a normal relative URL in session history', async () => {
    const agent = request.agent(buildHarness());
    const res = await agent.get('/en-GB/some-page');
    expect(res.body.history).toEqual([expect.objectContaining({ url: '/en-GB/some-page', method: 'GET' })]);
  });
});
