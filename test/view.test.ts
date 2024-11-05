import { NextFunction, Request, Response } from 'express';
import request from 'supertest';

import { i18next } from '../src/middleware/translation';
import app from '../src/app';
import { appConfig } from '../src/config';

import { mockBackend } from './mocks/backend';

const t = i18next.t;

jest.mock('../src/middleware/ensure-authenticated', () => ({
    ensureAuthenticated: (req: Request, res: Response, next: NextFunction) => next()
}));

describe('Developer View Routes', () => {
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

    test('Check list endpoint returns a list of files', async () => {
        const res = await request(app).get('/en-GB/dataset');
        expect(res.status).toBe(200);
        expect(res.text).toContain('test dataset 1');
    });

    test('Data is rendered in the frontend', async () => {
        const res = await request(app).get('/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5');
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
        const res = await request(app).get('/en-GB/dataset/missing-id');
        expect(res.status).toBe(404);
        expect(res.text).toContain(t('errors.not_found'));
    });
});
