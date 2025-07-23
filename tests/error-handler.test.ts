import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import { http, HttpResponse } from 'msw';
import { parse as parseCookies } from 'set-cookie-parser';

import { i18next } from '../src/shared/middleware/translation';
import app from '../src/publisher/app';
import { Locale } from '../src/shared/enums/locale';
import { appConfig } from '../src/shared/config';

import { mockBackend } from './mocks/backend';

jest.mock('../src/publisher/middleware/ensure-authenticated', () => ({
  ensureAuthenticated: (req: Request, res: Response, next: NextFunction) => next()
}));

describe('Error handling', () => {
  const config = appConfig();
  const t = i18next.t;

  beforeAll(() => {
    mockBackend.listen({
      onUnhandledRequest: ({ url }, print) => {
        if (!url.includes(config.backend.url)) return;
        print.error();
      }
    });
  });

  afterEach(() => {
    mockBackend.resetHandlers();
  });

  afterAll(() => mockBackend.close());

  test('should delete the jwt cookie and redirect to login page after logout', async () => {
    mockBackend.use(http.get('http://localhost:3001/dataset', () => new HttpResponse(null, { status: 401 })));

    const res = await request(app).get('/en-GB');
    const jwtCookie = parseCookies(res.headers['set-cookie']).find((cookie) => cookie.name === 'jwt');

    expect(res.status).toBe(302);
    expect(res.header.location).toBe(`/en-GB/auth/login`);
    expect(jwtCookie?.expires?.getTime()).toBeLessThan(Date.now()); // expiry should be in the past to delete
  });

  test('should render the not found page for 404s', async () => {
    const res = await request(app).get('/en-GB/not-a-thing');
    expect(res.status).toBe(404);
    expect(res.text).toContain(t('errors.not_found', { lng: Locale.English }));
  });

  test('should render the error page for 500s', async () => {
    mockBackend.use(http.get('http://localhost:3001/dataset', () => new HttpResponse(null, { status: 500 })));
    const res = await request(app).get('/en-GB');
    expect(res.status).toBe(500);
    expect(res.text).toContain(t('errors.server_error', { lng: Locale.English }));
  });

  test('should render the error page for everything else', async () => {
    mockBackend.use(http.get('http://localhost:3001/dataset', () => HttpResponse.error()));
    const res = await request(app).get('/en-GB');
    expect(res.status).toBe(500);
    expect(res.text).toContain(t('errors.server_error', { lng: Locale.English }));
  });
});
