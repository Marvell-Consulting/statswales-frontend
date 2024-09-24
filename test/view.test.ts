import { NextFunction, Request, Response } from 'express';
import request from 'supertest';

import { i18next } from '../src/middleware/translation';
import app from '../src/app';

import { server } from './helpers/mock-server';

const t = i18next.t;

jest.mock('../src/middleware/ensure-authenticated', () => ({
    ensureAuthenticated: (req: Request, res: Response, next: NextFunction) => next()
}));

describe('Developer View Routes', () => {
    beforeAll(() => {
        server.listen({
            onUnhandledRequest: ({ headers, method, url }) => {
                if (url.includes('http://example.com:3001')) {
                    console.log('Request to unahndled URL:', method, url);
                }
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
        server.resetHandlers();
    });

    afterAll(() => server.close());

    test('Check list endpoint returns a list of files', async () => {
        const res = await request(app).get('/en-GB/dataset').set('User-Agent', 'supertest');
        expect(res.status).toBe(200);
        expect(res.text).toContain('test dataset 1');
    });

    test('Data is rendered in the frontend', async () => {
        const res = await request(app)
            .get('/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5')
            .set('User-Agent', 'supertest');
        expect(res.status).toBe(200);
        // Header
        expect(res.text).toContain(`<th scope="col" class="govuk-table__header">ID</th>`);
        expect(res.text).toContain(`<th scope="col" class="govuk-table__header">Text</th>`);
        expect(res.text).toContain(`<th scope="col" class="govuk-table__header">Number</th>`);
        // First Row
        expect(res.text).toContain(`<td class="govuk-table__cell">1</td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">test1</td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">3423196</td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">2001-09-20</td>`);
        // Last Row
        expect(res.text).toContain(`<td class="govuk-table__cell">2</td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">AcHVoWJblA</td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">4470652</td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">2002-03-18</td>`);
        expect(res.text).toContain('Showing lines 1 - 2 of 2');
    });

    test('Data display returns 404 if no file available', async () => {
        const res = await request(app).get('/en-GB/dataset/missing-id').set('User-Agent', 'supertest');
        expect(res.status).toBe(404);
        expect(res.text).toContain(t('errors.problem'));
        expect(res.text).toContain(t('errors.dataset_missing'));
    });
});
