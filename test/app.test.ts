import request from 'supertest';
import { Request, Response, NextFunction } from 'express';

import { ENGLISH, WELSH, i18next } from '../src/middleware/translation';
import app from '../src/app';

import { mockBackend } from './mocks/backend';

const t = i18next.t;

jest.mock('../src/middleware/ensure-authenticated', () => ({
    ensureAuthenticated: (req: Request, res: Response, next: NextFunction) => next()
}));

describe('Test homepage, middleware and healthcheck', () => {
    beforeAll(() => {
        mockBackend.listen({
            onUnhandledRequest: ({ headers, method, url }) => {
                if (headers.get('User-Agent') !== 'supertest') {
                    throw new Error(`Unhandled ${method} request to ${url}`);
                }
            }
        });
        app.get('/test', (req, res, next) => {
            res.send('Test');
            next();
        });
    });

    afterEach(() => {
        mockBackend.resetHandlers();
    });

    afterAll(() => mockBackend.close());

    describe('Homepage and language Redirects', () => {
        test('Redirects to language when going to /', async () => {
            const res = await request(app).get('/').set('User-Agent', 'supertest');
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/en-GB');
        });

        test('Redirects to welsh when accept-header is present when going to /', async () => {
            const res = await request(app).get('/').set('Accept-Language', WELSH).set('User-Agent', 'supertest');
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/cy-GB');
        });

        test('App Homepage has correct title', async () => {
            const res = await request(app).get(`/${ENGLISH}`).set('User-Agent', 'supertest');
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('homepage.title', { lng: ENGLISH }));
        });

        test('App Homepage has correct title in welsh', async () => {
            const res = await request(app).get(`/${WELSH}`).set('User-Agent', 'supertest');
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('homepage.title', { lng: WELSH }));
        });
    });

    describe('Healthcheck Test', () => {
        test('Check initial healthcheck endpoint works', async () => {
            const res = await request(app).get('/healthcheck').set('User-Agent', 'supertest');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                status: 'App is running',
                notes: 'Expand endpoint to check for database connection and other services.',
                services: {
                    backend_connected: true
                }
            });
        });
    });
});
