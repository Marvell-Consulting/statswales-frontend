import request from 'supertest';
import JWT from 'jsonwebtoken';
import { parse as parseCookies } from 'set-cookie-parser';

import { i18next } from '../src/shared/middleware/translation';
import app from '../src/publisher/app';
import { config } from '../src/shared/config';
import { Locale } from '../src/shared/enums/locale';
import { AppEnv } from '../src/shared/config/env.enum';

import { mockBackend } from './mocks/backend';

describe('Authentication', () => {
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
    test('should redirect to login page when not authenticated', async () => {
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

    test('expired token error', async () => {
      const res = await request(app).get('/en-GB/auth/login?error=expired');
      expect(res.text).toContain(t('login.error.expired', { lng: Locale.English }));
    });
  });

  describe('/local', () => {
    const originalEnv = config.env;

    afterEach(() => {
      config.env = originalEnv;
    });

    test('form login is available in CI', async () => {
      const res = await request(app).get('/en-GB/auth/local');
      expect(res.status).toBe(200);
    });

    test('form login redirects to the backend with the username encoded', async () => {
      const res = await request(app).post('/en-GB/auth/local').type('form').send({ username: 'a&b=c' });
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(`${config.backend.url}/auth/local?username=a%26b%3Dc`);
    });

    test.each([AppEnv.Staging, AppEnv.Prod, AppEnv.Default])('form login is not found in %s', async (env) => {
      config.env = env;
      const getRes = await request(app).get('/en-GB/auth/local');
      expect(getRes.status).toBe(404);

      const postRes = await request(app).post('/en-GB/auth/local').type('form').send({ username: 'test' });
      expect(postRes.status).toBe(404);
      expect(postRes.header.location).toBeUndefined();
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
