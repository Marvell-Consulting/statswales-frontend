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

describe('Error handling', () => {
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

    test('should return 404', async () => {
        const res = await request(app).get('/en-GB/not-a-thing');
        expect(res.status).toBe(404);
        expect(res.text).toContain(t('errors.not_found', { lng: Locale.English }));
    });
});
