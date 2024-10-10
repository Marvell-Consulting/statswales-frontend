import request from 'supertest';
import { Request, Response, NextFunction } from 'express';

import { i18next } from '../src/middleware/translation';
import app from '../src/app';
import { Locale } from '../src/enums/locale';
import { appConfig } from '../src/config';

import { mockBackend } from './mocks/backend';

jest.mock('../src/middleware/ensure-authenticated', () => ({
    ensureAuthenticated: (req: Request, res: Response, next: NextFunction) => next()
}));

describe('Homepage', () => {
    const config = appConfig();
    const t = i18next.t;

    beforeAll(() => {
        mockBackend.listen({
            onUnhandledRequest: ({ headers, method, url }, print) => {
                if (!url.includes(config.backend.url)) return;
                print.error();
            }
        });
    });

    afterEach(() => {
        mockBackend.resetHandlers();
    });

    afterAll(() => mockBackend.close());

    describe('Language redirects', () => {
        test('Redirects to language when going to /', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/en-GB');
        });

        test('Redirects to welsh when accept-header is present when going to /', async () => {
            const res = await request(app).get('/').set('Accept-Language', Locale.Welsh);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/cy-GB');
        });

        test('Persists query params when redirecting', async () => {
            const res = await request(app).get('/?foo=bar').set('Accept-Language', Locale.Welsh);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/cy-GB?foo=bar');
        });
    });

    describe('Content', () => {
        test('Has the correct title', async () => {
            const res = await request(app).get(`/${Locale.EnglishGb}`);
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('homepage.title', { lng: Locale.English }));
        });

        test('Has the correct title in Welsh', async () => {
            const res = await request(app).get(`/${Locale.WelshGb}`);
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('homepage.title', { lng: Locale.Welsh }));
        });
    });
});
