import request from 'supertest';
import { http, HttpResponse } from 'msw';

import { i18next } from '../src/middleware/translation';
import app from '../src/app';
import { Locale } from '../src/enums/locale';
import { appConfig } from '../src/config';

import { mockBackend } from './mocks/backend';

const t = i18next.t;

describe('Healthcheck', () => {
    const config = appConfig();

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

    test('Returns true if the backend is connected', async () => {
        const res = await request(app).get('/healthcheck');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 200, lang: Locale.English, services: { backend: true } });
    });

    test('Returns false if the backend is not connected', async () => {
        mockBackend.use(http.get('http://example.com:3001/healthcheck', () => HttpResponse.error()));

        const res = await request(app).get('/healthcheck');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 200, lang: Locale.English, services: { backend: false } });
    });
});
