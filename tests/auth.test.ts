import request from 'supertest';
import JWT from 'jsonwebtoken';
import { parse as parseCookies } from 'set-cookie-parser';

import { i18next } from '../src/middleware/translation';
import app from '../src/app';
import { appConfig } from '../src/config';
import { Locale } from '../src/enums/locale';

import { mockBackend } from './mocks/backend';

describe('Authentication', () => {
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

  describe('Ensure authenticated', () => {
    test.only('should redirect to login page when not authenticated', async () => {
      const res = await request(app).get('/en-GB');
      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/en-GB/auth/login');
    });
  });

  describe('/login', () => {
    test('login page displays successfully', async () => {
      const res = await request(app).get('/en-GB/auth/login');
      expect(res.text).toContain(t('login.heading', { lng: Locale.English }));
    });

    test('supports google', async () => {
      const res = await request(app).get('/en-GB/auth/login');
      expect(res.text).toContain(t('login.buttons.google', { lng: Locale.English }));
    });

    test('supports entraid', async () => {
      const res = await request(app).get('/en-GB/auth/login');
      expect(res.text).toContain(t('login.buttons.entraid', { lng: Locale.English }));
    });

    test('expired token error', async () => {
      const res = await request(app).get('/en-GB/auth/login?error=expired');
      expect(res.text).toContain(t('login.error.expired', { lng: Locale.English }));
    });
  });

  describe('/google', () => {
    test('should redirect to google auth on backend', async () => {
      const res = await request(app).get('/en-GB/auth/google');
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(`${config.backend.url}/auth/google?lang=en-GB`);
    });
  });

  describe('/entraid', () => {
    test('should redirect to entraid auth on backend', async () => {
      const res = await request(app).get('/en-GB/auth/entraid');
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(`${config.backend.url}/auth/entraid?lang=en-GB`);
    });
  });

  describe('/callback', () => {
    test('should display an error if there was a problem authenticating with a 3rd party', async () => {
      const res = await request(app).get('/en-GB/auth/callback?error=expired');
      expect(res.status).toBe(400);
      expect(res.text).toContain(t('login.error.generic', { lng: Locale.English }));
    });

    test('should display an error if the jwt cookie is missing', async () => {
      const res = await request(app).get('/en-GB/auth/callback');
      expect(res.status).toBe(400);
      expect(res.text).toContain(t('login.error.generic', { lng: Locale.English }));
    });

    test('should redirect to homepage on successful login', async () => {
      const jwt = JWT.sign({ user: { id: 1, name: 'test' } }, config.auth.jwt.secret);
      const res = await request(app).get('/en-GB/auth/callback').set('Cookie', `jwt=${jwt}`);
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(`/en-GB`);
    });
  });

  describe('/logout', () => {
    test('should delete the jwt cookie and redirect to login page after logout', async () => {
      const res = await request(app).get('/en-GB/auth/logout');
      const jwtCookie = parseCookies(res.headers['set-cookie']).find((cookie) => cookie.name === 'jwt');
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(`/en-GB/auth/login`);
      expect(jwtCookie?.expires?.getTime()).toBeLessThan(Date.now()); // expiry should be in the past to delete
    });
  });
});
