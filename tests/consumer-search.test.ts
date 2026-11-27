import { http, HttpResponse } from 'msw';
import request from 'supertest';

import app from '../src/consumer/app';
import { config } from '../src/shared/config';

import { mockBackend } from './mocks/backend';

describe('Search', () => {
  let searches: URLSearchParams[] = [];

  beforeAll(() => {
    mockBackend.listen({ onUnhandledRequest: 'bypass' });
  });

  beforeEach(() => {
    searches = [];
    mockBackend.use(
      http.get(`${config.backend.url}/v2/search`, ({ request: req }) => {
        searches.push(new URL(req.url).searchParams);
        return HttpResponse.json({ data: [], count: 0 });
      })
    );
  });

  afterEach(() => {
    mockBackend.resetHandlers();
  });

  afterAll(() => mockBackend.close());

  // The backend stems English searches in fts mode, so "accidents" finds "accident". It searches Welsh without
  // stemming in either mode.
  test.each(['en-GB', 'cy-GB'])('asks the backend for an fts search in %s', async (lang) => {
    const res = await request(app).get(`/${lang}/search?keywords=road%20accidents`);

    expect(res.status).toBe(200);
    expect(searches).toHaveLength(1);
    expect(searches[0].get('mode')).toBe('fts');
    expect(searches[0].get('keywords')).toBe('road accidents');
    expect(searches[0].get('lang')).toBe(lang);
  });
});
