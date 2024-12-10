import path from 'node:path';

import { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { http, HttpResponse } from 'msw';

import { i18next } from '../src/middleware/translation';
import app from '../src/app';
import { appConfig } from '../src/config';
import { ViewError } from '../src/dtos/view-error';

import { mockBackend } from './mocks/backend';
import { datasetWithTitle, datasetWithImport, completedDataset } from './mocks/fixtures';

const t = i18next.t;

declare module 'express-session' {
    interface SessionData {
        errors: ViewError[] | undefined;
    }
}

jest.mock('../src/middleware/ensure-authenticated', () => ({
    ensureAuthenticated: (req: Request, res: Response, next: NextFunction) => next()
}));

jest.mock('../src/middleware/rate-limiter', () => ({
    rateLimiter: (req: Request, res: Response, next: NextFunction) => next()
}));

describe('Publisher Journey Tests', () => {
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

    afterAll(() => {
        mockBackend.close();
    });

    describe('Start page', () => {
        test('Publish start page returns OK', async () => {
            const res = await request(app).get('/en-GB/publish');
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('publish.start.title'));
        });
    });

    describe('Create a dataset with a title', () => {
        test('Publish title page returns OK', async () => {
            const res = await request(app).get('/en-GB/publish/title');
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('publish.title.heading', { lng: 'en-GB' }));
        });

        test('Publish title page returns 400 if no title is provided', async () => {
            const res = await request(app).post('/en-GB/publish/title');
            expect(res.status).toBe(400);
            expect(res.text).toContain(t('publish.title.form.title.error.missing'));
        });

        test('Set title returns 302 and directs the user to the upload page', async () => {
            const res = await request(app).post('/en-GB/publish/title').field('title', 'Test dataset 1');
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/${datasetWithTitle.id}/upload`);
        });
    });

    describe('Upload the initial CSV', () => {
        test('Get the upload page returns 200', async () => {
            const res = await request(app).get(`/en-GB/publish/${datasetWithTitle.id}/upload`);
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('publish.upload.title'));
        });

        test('Upload returns 400 and an error if no file attached', async () => {
            const res = await request(app).post(`/en-GB/publish/${datasetWithTitle.id}/upload`);
            expect(res.status).toBe(400);
            expect(res.text).toContain('No CSV data available');
        });

        test('Upload returns 400 and an error if upload fails', async () => {
            mockBackend.use(
                http.post('http://example.com:3001/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/data', () =>
                    HttpResponse.error()
                )
            );
            const csvfile = path.resolve(__dirname, `./sample-csvs/test-data-1.csv`);
            const res = await request(app).post(`/en-GB/publish/${datasetWithTitle.id}/upload`).attach('csv', csvfile);
            expect(res.status).toBe(400);
            expect(res.text).toContain('No CSV data available');
        });

        test('Successful upload sends the user to the preview page', async () => {
            const csvfile = path.resolve(__dirname, `./sample-csvs/test-data-1.csv`);
            const res = await request(app).post(`/en-GB/publish/${datasetWithTitle.id}/upload`).attach('csv', csvfile);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/${datasetWithTitle.id}/preview`);
        });
    });

    describe('Preview and confirm the data table', () => {
        test('Dataset preview is rendered in the frontend', async () => {
            const res = await request(app).get(`/en-GB/publish/${datasetWithImport.id}/preview`);
            expect(res.status).toBe(200);

            // TODO: either use a DOM lib or a framework like playwright
            // testing strings is flakey due to whitespace
            // // Header
            // expect(res.text).toContain(`<th scope="col" class="govuk-table__header">ID</th>`);
            // expect(res.text).toContain(`<th scope="col" class="govuk-table__header">Text</th>`);
            // expect(res.text).toContain(`<th scope="col" class="govuk-table__header">Number</th>`);
            // // First Row
            // expect(res.text).toContain(`<td class="govuk-table__cell">1</td>`);
            // expect(res.text).toContain(`<td class="govuk-table__cell">test1</td>`);
            // expect(res.text).toContain(`<td class="govuk-table__cell">3423196</td>`);
            // expect(res.text).toContain(`<td class="govuk-table__cell">2001-09-20</td>`);
            // // Last Row
            // expect(res.text).toContain(`<td class="govuk-table__cell">2</td>`);
            // expect(res.text).toContain(`<td class="govuk-table__cell">AcHVoWJblA</td>`);
            // expect(res.text).toContain(`<td class="govuk-table__cell">4470652</td>`);
            // expect(res.text).toContain(`<td class="govuk-table__cell">2002-03-18</td>`);
            // expect(res.text).toContain('Showing rows 1 – 2 of 2');
        });

        test('Confirming a preview returns 302 to sources if the confirmation is a success', async () => {
            const res = await request(app)
                .post(`/en-GB/publish/${datasetWithImport.id}/preview`)
                .field('confirm', 'true');
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/${datasetWithImport.id}/sources`);
        });

        test('Confirming a preview returns 302 back to preview if the confirmation failed due to a server error', async () => {
            mockBackend.use(
                http.patch(
                    `http://example.com:3001/dataset/${datasetWithImport.id}/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/fact-table/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953/confirm`,
                    () => HttpResponse.error()
                )
            );
            const res = await request(app)
                .post(`/en-GB/publish/${datasetWithImport.id}/preview`)
                .field('confirm', 'true');
            expect(res.status).toBe(500);
            expect(res.text).toContain(t('errors.preview.confirm_error'));
        });
    });

    describe('Setting up sources and dimensions', () => {
        test('Viewing sources page returns 200', async () => {
            const res = await request(app).get(`/en-GB/publish/${datasetWithImport.id}/sources`);
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('publish.sources.heading'));
        });

        test('Confirming a multiple datavalies, a single footnote and dimensions returns 400 and a message to the user', async () => {
            const res = await request(app)
                .post(`/en-GB/publish/${datasetWithImport.id}/sources`)
                .field('column-0', 'ignore')
                .field('column-1', 'data_values')
                .field('column-2', 'data_values')
                .field('column-3', 'dimension')
                .field('column-4', 'dimension');
            expect(res.status).toBe(400);
            expect(res.text).toContain(t('errors.problem'));
            expect(res.text).toContain(t('errors.sources.multiple_datavalues'));
        });

        test('Confirming a multiple Footnotes and dimensions returns 400 and a message to the user', async () => {
            const res = await request(app)
                .post(`/en-GB/publish/${datasetWithImport.id}/sources`)
                .field('column-0', 'ignore')
                .field('column-1', 'note_codes')
                .field('column-2', 'note_codes')
                .field('column-3', 'dimension')
                .field('column-4', 'dimension');
            expect(res.status).toBe(400);
            expect(res.text).toContain(t('errors.problem'));
            expect(res.text).toContain(t('errors.sources.multiple_footnotes'));
        });

        test('Confirming a multiple Measures and dimensions returns 400 and a message to the user', async () => {
            const res = await request(app)
                .post(`/en-GB/publish/${datasetWithImport.id}/sources`)
                .field('column-0', 'ignore')
                .field('column-1', 'measure')
                .field('column-2', 'measure')
                .field('column-3', 'dimension')
                .field('column-4', 'dimension');
            expect(res.status).toBe(400);
            expect(res.text).toContain(t('errors.problem'));
            expect(res.text).toContain(t('errors.sources.multiple_measures'));
        });

        test('Leave values as unknown results in a 400 error and message to user', async () => {
            const res = await request(app)
                .post(`/en-GB/publish/${datasetWithImport.id}/sources`)
                .field('column-0', 'unknown')
                .field('column-1', 'unknown')
                .field('column-2', 'unknown')
                .field('column-3', 'unknown')
                .field('column-4', 'unknown');
            expect(res.status).toBe(400);
            expect(res.text).toContain(t('errors.problem'));
            expect(res.text).toContain(t('errors.sources.unknowns_found'));
        });

        test('An http error when sending sources to server returns 500 and keeps the user on sources', async () => {
            mockBackend.use(
                http.patch(
                    `http://example.com:3001/dataset/${datasetWithImport.id}/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/fact-table/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953/sources`,
                    () => HttpResponse.error()
                )
            );

            const res = await request(app)
                .post(`/en-GB/publish/${datasetWithImport.id}/sources`)
                .field('fea70d3f-beb9-491c-83fb-3fae2daa1702', 'ignore')
                .field('195e44f0-0bf2-40ea-8567-8e7f5dc96054', 'data_values')
                .field('d5f8a827-9f6d-4b37-974d-cdfcb3380032', 'foot_notes')
                .field('32894949-e758-4974-a932-455d51895293', 'dimension')
                .field('8b2ef050-fe84-4150-b124-f993a5e56dc3', 'dimension');
            expect(res.status).toBe(500);
            expect(res.text).toContain(t('errors.server_error'));
        });

        test('Confirming a single set of datavalues, a single footnote and dimensions returns 200 and a JSON blob', async () => {
            const res = await request(app)
                .post(`/en-GB/publish/${datasetWithImport.id}/sources`)
                .field('fea70d3f-beb9-491c-83fb-3fae2daa1702', 'ignore')
                .field('195e44f0-0bf2-40ea-8567-8e7f5dc96054', 'data_values')
                .field('d5f8a827-9f6d-4b37-974d-cdfcb3380032', 'foot_notes')
                .field('32894949-e758-4974-a932-455d51895293', 'dimension')
                .field('8b2ef050-fe84-4150-b124-f993a5e56dc3', 'dimension');
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/${datasetWithImport.id}/tasklist`);
        });
    });

    describe('Tasklist', () => {
        test('It loads the dataset', async () => {
            const res = await request(app).get(`/en-GB/publish/${completedDataset.id}/tasklist`);
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('publish.tasklist.heading'));
            expect(res.text).toContain('Completed dataset');
            expect(res.text).toContain(t('publish.tasklist.data.datatable'));
            expect(res.text).toContain(t('publish.tasklist.metadata.update_frequency'));
            expect(res.text).toContain(t('publish.tasklist.publishing.when'));
        });

        test('It throws a 404 if the dataset id is invalid', async () => {
            const res = await request(app).get(`/en-GB/publish/not-a-dataset-uuid/tasklist`);
            expect(res.status).toBe(404);
            expect(res.text).toContain(t('errors.not_found'));
        });
    });

    describe('Metadata: Title', () => {
        test('It reuturns 200 when returning to edit a title', async () => {
            const res = await request(app).get(`/en-GB/publish/${completedDataset.id}/title`);
            expect(res.status).toBe(200);
            expect(res.text).toContain('<div class="top-links">');
            expect(res.text).toContain(t('publish.title.heading'));
            expect(res.text).toContain('Completed dataset');
        });

        test('It returns 302 to the task list on a successful submit', async () => {
            const res = await request(app)
                .post(`/en-GB/publish/${completedDataset.id}/title`)
                .field('title', 'Completed dataset B');
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/${completedDataset.id}/tasklist`);
        });

        test('It returns 400 if no title is supplied', async () => {
            const res = await request(app).post(`/en-GB/publish/${completedDataset.id}/title`);
            expect(res.status).toBe(400);
            expect(res.text).toContain(t('errors.problem'));
        });
    });
});
