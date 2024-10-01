import path from 'node:path';
import fs from 'node:fs';

import { NextFunction, Request, Response } from 'express';
import request from 'supertest';

import { i18next } from '../src/middleware/translation';
import app from '../src/app';
import { DatasetDTO, FileImportDTO, RevisionDTO } from '../src/dtos/dataset-dto';
import { ViewErrDTO } from '../src/dtos/view-dto';
import { DimensionCreationDTO } from '../src/dtos/dimension-creation-dto';

import { server } from './helpers/mock-server';

const t = i18next.t;

declare module 'express-session' {
    interface SessionData {
        currentDataset: DatasetDTO | undefined;
        currentRevision: RevisionDTO | undefined;
        currentImport: FileImportDTO | undefined;
        errors: ViewErrDTO | undefined;
        dimensionCreationRequest: DimensionCreationDTO[];
        currentTitle: string | undefined;
    }
}

jest.mock('../src/middleware/ensure-authenticated', () => ({
    ensureAuthenticated: (req: Request, res: Response, next: NextFunction) => next()
}));

jest.mock('../src/middleware/rate-limiter', () => ({
    rateLimiter: (req: Request, res: Response, next: NextFunction) => next()
}));

describe('Publisher Journey Tests', () => {
    beforeAll(() => {
        server.listen({
            onUnhandledRequest: ({ headers, method, url }) => {
                const parsedUrl = new URL(url);
                if (parsedUrl.host === 'example.com:3001') {
                    console.log('Request to unhandled URL:', method, url);
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

    afterAll(() => {
        server.close();
    });

    async function clearSession() {
        console.log('Clearing the session');
        const res = await request(app).get('/en-GB/publish').set('User-Agent', 'supertest');
        if (res.error) {
            console.log(res.error);
            throw new Error('Failed to clear session');
        }
        return res.headers['set-cookie'];
    }

    async function setTitleToSession(title: string) {
        const res = await request(app)
            .post('/en-GB/publish/title')
            .set('User-Agent', 'supertest')
            .field('title', title);
        if (res.error) {
            console.log(res.error);
            throw new Error('Failed to set title');
        }
        return res.headers['set-cookie'];
    }

    async function setDatasetToSession(title?: string) {
        const titleCookie = await setTitleToSession(title || 'test dataset 1');
        const csvfile = path.resolve(__dirname, `./sample-csvs/test-data-1.csv`);
        console.log(`Saving dataset to session, csv filepath: ${csvfile}`);
        const res = await request(app)
            .post('/en-GB/publish/upload')
            .set('User-Agent', 'supertest')
            .set('Cookie', titleCookie)
            .attach('csv', csvfile);
        if (res.error) {
            console.log(res.error);
            throw new Error('Failed to upload dataset');
        }
        return res.headers['set-cookie'];
    }

    async function setSourcesIntoSession(title?: string) {
        const datasetCookie = await setDatasetToSession(title);
        const res = await request(app)
            .post('/en-GB/publish/preview')
            .field('confirm', 'true')
            .set('User-Agent', 'supertest')
            .set('Cookie', datasetCookie);
        if (res.error) {
            console.log(res.error);
            throw new Error('Failed to set sources');
        }
        return res.headers['set-cookie'];
    }

    describe('Test session routes', () => {
        test('Get the session returns 200 with some data in it', async () => {
            const cookies = await setDatasetToSession();
            const res = await request(app)
                .get('/en-GB/publish/session')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(200);
            expect(res.text).toContain('currentDataset');
            expect(res.text).toContain('currentRevision');
            expect(res.text).toContain('currentImport');
        });

        test('Removing all session data returns 200 with message', async () => {
            const cookies = await setDatasetToSession();
            const res = await request(app)
                .delete('/en-GB/publish/session')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'All session data has been cleared' });
        });

        test('Delete current revision returns 200 with message and removes the current revision from session', async () => {
            const cookies = await setDatasetToSession();
            const res = await request(app)
                .delete('/en-GB/publish/session/currentrevision')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Current revision has been deleted' });

            const sessionRes = await request(app)
                .get('/en-GB/publish/session')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(sessionRes.status).toBe(200);
            expect(sessionRes.text).toContain('currentDataset');
            expect(sessionRes.text).not.toContain('currentRevision');
            expect(sessionRes.text).toContain('currentImport');
        });

        test('Delete current import returns 200 with message and removes the current revision from session', async () => {
            const cookies = await setDatasetToSession();
            const res = await request(app)
                .delete('/en-GB/publish/session/currentimport')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Current import has been deleted' });

            const sessionRes = await request(app)
                .get('/en-GB/publish/session')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(sessionRes.status).toBe(200);
            expect(sessionRes.text).toContain('currentDataset');
            expect(sessionRes.text).toContain('currentRevision');
            expect(sessionRes.text).not.toContain('currentImport');
        });
    });

    describe('Publish start page', () => {
        test('Publish start page returns OK', async () => {
            const res = await request(app).get('/en-GB/publish').set('User-Agent', 'supertest');
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('publish.start.title'));
        });
    });

    describe('Give a dataset a title', () => {
        test('Publish title page returns OK', async () => {
            const res = await request(app).get('/en-GB/publish/title').set('User-Agent', 'supertest');
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('publish.title.heading', { lng: 'en-GB' }));
        });

        test('Publish title page returns 400 if no title is provided', async () => {
            const res = await request(app).post('/en-GB/publish/title').set('User-Agent', 'supertest');
            expect(res.status).toBe(400);
            expect(res.text).toContain(t('errors.title.missing'));
        });

        test('Set title returns 302 and directs the user to the upload', async () => {
            const res = await request(app)
                .post('/en-GB/publish/title')
                .set('User-Agent', 'supertest')
                .field('title', 'Test dataset 1');
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/upload`);
        });
    });

    describe('Upload the initial fact table to create a dataset', () => {
        test('Upload returns 302 if a file is attached', async () => {
            const csvfile = path.resolve(__dirname, `./sample-csvs/test-data-1.csv`);
            const cookies = await setTitleToSession('Test dataset 1');

            const res = await request(app)
                .post('/en-GB/publish/upload')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies)
                .attach('csv', csvfile);

            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/preview`);
        });

        test('Upload returns 302 and sends user back to title if no title provided', async () => {
            const csvfile = path.resolve(__dirname, `./sample-csvs/test-data-1.csv`);

            const res = await request(app)
                .post('/en-GB/publish/upload')
                .set('User-Agent', 'supertest')
                .attach('csv', csvfile);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/title`);
        });

        test('Upload returns 400 and an error if no file attached', async () => {
            const cookies = await setTitleToSession('Test dataset 1');
            const res = await request(app)
                .post('/en-GB/publish/upload')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(400);
            expect(res.text).toContain('No CSV data available');
        });

        test('Upload returns 302 if API says upload was not a success and redirect to start', async () => {
            const csvfile = path.resolve(__dirname, `./sample-csvs/test-data-1.csv`);
            const cookies = await setTitleToSession('test-data-3.csv fail test');
            const res = await request(app)
                .post('/en-GB/publish/upload')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies)
                .attach('csv', csvfile);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/`);
        });

        test('Get the upload page returns 302 and redirects back to the title page if no title is set', async () => {
            const res = await request(app).get('/en-GB/publish/upload').set('User-Agent', 'supertest');
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/title`);
        });

        test('Get the upload page returns 200 if title is set in the session', async () => {
            const cookies = await setTitleToSession('Test dataset 1');
            const res = await request(app)
                .get('/en-GB/publish/upload')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('publish.upload.title'));
        });

        test('Uploading a CSV when a dataset is present in the session results in a 302 and redirects to preview', async () => {
            const csvfile = path.resolve(__dirname, `./sample-csvs/test-data-1.csv`);
            const cookies = await setDatasetToSession();
            const res = await request(app)
                .post('/en-GB/publish/upload')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies)
                .attach('csv', csvfile);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/preview`);
        });

        test('Not including a csv when a dataset is present in the session results in a 400 error', async () => {
            const cookies = await setDatasetToSession();
            const res = await request(app)
                .post('/en-GB/publish/upload')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(400);
            expect(res.text).toContain('No CSV data available');
        });
    });

    describe('Preview and confirm the fact table', () => {
        test('Dataset preview is rendered in the frontend', async () => {
            const cookies = await setDatasetToSession();

            const res = await request(app)
                .get('/en-GB/publish/preview')
                .set('Cookie', cookies)
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
            expect(res.text).toContain('Showing rows 1 - 2 of 2');
        });

        test('Dataset preview returns 302 if no currentDataset is present in the session', async () => {
            const res = await request(app).get('/en-GB/publish/preview').set('User-Agent', 'supertest');
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/`);
        });

        test('Dataset preview returns 302 if no currentRevision is present in the session', async () => {
            const cookies = await setDatasetToSession();
            await request(app)
                .delete('/en-GB/publish/session/currentrevision')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            const res = await request(app)
                .get('/en-GB/publish/preview')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/`);
        });

        test('Dataset preview returns 302 if no currentImport is present in the session', async () => {
            const cookies = await setDatasetToSession();
            await request(app)
                .delete('/en-GB/publish/session/currentimport')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            const res = await request(app)
                .get('/en-GB/publish/preview')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/`);
        });

        test('Dataset preview returns 302 if the API returns an error', async () => {
            const cookies = await setDatasetToSession('test-data-4.csv broken preview');
            const res = await request(app)
                .get('/en-GB/publish/preview')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/`);
        });
    });

    describe('Confirm a preview', () => {
        test('Confirming a preview returns 302 to sources if the confirmation is a success', async () => {
            const cookies = await setDatasetToSession();
            const res = await request(app)
                .post('/en-GB/publish/preview')
                .field('confirm', 'true')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/sources`);
        });

        test('Confirming a preview returns 302 back to preview if the confirmation failed due to a server error', async () => {
            const cookies = await setDatasetToSession('test-data-4.csv broken preview');
            const res = await request(app)
                .post('/en-GB/publish/preview')
                .field('confirm', 'true')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/preview/`);
        });

        test('Rejecting a preview returns 302 back to upload', async () => {
            const cookies = await setDatasetToSession();
            const res = await request(app)
                .post('/en-GB/publish/preview')
                .field('confirm', 'false')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/upload`);
        });

        test('Rejecting a preview returns 302 back to preview if the rejection failed due to a server error', async () => {
            const cookies = await setDatasetToSession('test-data-4.csv broken preview');
            const res = await request(app)
                .post('/en-GB/publish/preview')
                .field('confirm', 'false')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/preview`);
        });

        test('If confirmation is missing from the post request we error and return to preview', async () => {
            const cookies = await setDatasetToSession();
            const res = await request(app)
                .post('/en-GB/publish/preview')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/preview`);
        });

        describe('Broken Session test', () => {
            test('If the dataset is missing from the session return to the start of the journey', async () => {
                const res = await request(app)
                    .post('/en-GB/publish/preview')
                    .field('confirm', 'false')
                    .set('User-Agent', 'supertest');
                expect(res.status).toBe(302);
                expect(res.header.location).toBe(`/en-GB/publish/`);
            });

            test('If the currentRevision is missing from the session return to the start of the journey', async () => {
                const cookies = await setDatasetToSession();
                await request(app)
                    .delete('/en-GB/publish/session/currentrevision')
                    .set('User-Agent', 'supertest')
                    .set('Cookie', cookies);
                const res = await request(app)
                    .post('/en-GB/publish/preview')
                    .field('confirm', 'false')
                    .set('User-Agent', 'supertest')
                    .set('Cookie', cookies);
                expect(res.status).toBe(302);
                expect(res.header.location).toBe(`/en-GB/publish/`);
            });

            test('If the currentImport is missing from the session return to the start of the journey', async () => {
                const cookies = await setDatasetToSession();
                await request(app)
                    .delete('/en-GB/publish/session/currentimport')
                    .set('User-Agent', 'supertest')
                    .set('Cookie', cookies);
                const res = await request(app)
                    .post('/en-GB/publish/preview')
                    .field('confirm', 'false')
                    .set('User-Agent', 'supertest')
                    .set('Cookie', cookies);
                expect(res.status).toBe(302);
                expect(res.header.location).toBe(`/en-GB/publish/`);
            });
        });
    });

    describe('Getting sources from the server so the user can identify them', () => {
        test('Getting sources returns 200 if currentImport with sources is present in session', async () => {
            const cookies = await setSourcesIntoSession();
            const res = await request(app)
                .get('/en-GB/publish/sources')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('publish.sources.heading'));
        });

        test('Getting sources returns 302 if currentImport has no sources present in session', async () => {
            await clearSession();
            const cookies = await setDatasetToSession();
            const res = await request(app)
                .get('/en-GB/publish/sources')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish`);
        });

        test('Getting sources return 302 if currentImport is missing from session', async () => {
            const cookie = await setDatasetToSession();
            await request(app)
                .delete('/en-GB/publish/session/currentimport')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookie);
            const res = await request(app)
                .get('/en-GB/publish/sources')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookie);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/`);
        });
    });

    describe('Setting up sources and dimensions', () => {
        test('Confirming a single set of datavalues, a single footnote and dimensions returns 200 and a JSON blob', async () => {
            const cookies = await setSourcesIntoSession();
            const res = await request(app)
                .post('/en-GB/publish/sources')
                .field('fea70d3f-beb9-491c-83fb-3fae2daa1702', 'ignore')
                .field('195e44f0-0bf2-40ea-8567-8e7f5dc96054', 'data_values')
                .field('d5f8a827-9f6d-4b37-974d-cdfcb3380032', 'foot_notes')
                .field('32894949-e758-4974-a932-455d51895293', 'dimension')
                .field('8b2ef050-fe84-4150-b124-f993a5e56dc3', 'dimension')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`/en-GB/publish/5caeb8ed-ea64-4a58-8cf0-b728308833e5/tasklist`);
        });

        test('Confirming a multiple datavalies, a single footnote and dimensions returns 400 and a message to the user', async () => {
            const cookies = await setSourcesIntoSession();
            const res = await request(app)
                .post('/en-GB/publish/sources')
                .field('fea70d3f-beb9-491c-83fb-3fae2daa1702', 'ignore')
                .field('195e44f0-0bf2-40ea-8567-8e7f5dc96054', 'data_values')
                .field('d5f8a827-9f6d-4b37-974d-cdfcb3380032', 'data_values')
                .field('32894949-e758-4974-a932-455d51895293', 'dimension')
                .field('8b2ef050-fe84-4150-b124-f993a5e56dc3', 'dimension')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(400);
            expect(res.text).toContain(t('errors.problem'));
            expect(res.text).toContain(t('errors.sources.multiple_datavalues'));
        });

        test('Confirming a multiple Footnotes and dimensions returns 400 and a message to the user', async () => {
            const cookies = await setSourcesIntoSession();
            const res = await request(app)
                .post('/en-GB/publish/sources')
                .field('fea70d3f-beb9-491c-83fb-3fae2daa1702', 'ignore')
                .field('195e44f0-0bf2-40ea-8567-8e7f5dc96054', 'foot_notes')
                .field('d5f8a827-9f6d-4b37-974d-cdfcb3380032', 'foot_notes')
                .field('32894949-e758-4974-a932-455d51895293', 'dimension')
                .field('8b2ef050-fe84-4150-b124-f993a5e56dc3', 'dimension')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(400);
            expect(res.text).toContain(t('errors.problem'));
            expect(res.text).toContain(t('errors.sources.multiple_footnotes'));
        });

        test('Leave values as unknown results in a 400 error and message to user', async () => {
            const cookies = await setSourcesIntoSession();
            const res = await request(app)
                .post('/en-GB/publish/sources')
                .field('fea70d3f-beb9-491c-83fb-3fae2daa1702', 'unknown')
                .field('195e44f0-0bf2-40ea-8567-8e7f5dc96054', 'unknown')
                .field('d5f8a827-9f6d-4b37-974d-cdfcb3380032', 'foot_notes')
                .field('32894949-e758-4974-a932-455d51895293', 'dimension')
                .field('8b2ef050-fe84-4150-b124-f993a5e56dc3', 'dimension')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(400);
            expect(res.text).toContain(t('errors.problem'));
            expect(res.text).toContain(t('errors.sources.unknowns_found'));
        });

        test('An http error when sending sources to server returns 500 and keeps the user on sources', async () => {
            const cookies = await setSourcesIntoSession('test-data-4.csv broken preview');
            const res = await request(app)
                .post('/en-GB/publish/sources')
                .field('fea70d3f-beb9-491c-83fb-3fae2daa1702', 'ignore')
                .field('195e44f0-0bf2-40ea-8567-8e7f5dc96054', 'data_values')
                .field('d5f8a827-9f6d-4b37-974d-cdfcb3380032', 'foot_notes')
                .field('32894949-e758-4974-a932-455d51895293', 'dimension')
                .field('8b2ef050-fe84-4150-b124-f993a5e56dc3', 'dimension')
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(500);
            expect(res.text).toContain(t('errors.problem'));
        });

        describe('Session issues for sources', () => {
            test('No dataset in the session when posting to sources returns 302 back to start', async () => {
                const res = await request(app).post('/en-GB/publish/sources').set('User-Agent', 'supertest');
                expect(res.status).toBe(302);
                expect(res.header.location).toBe(`/en-GB/publish/`);
            });

            test('No current revision in the session returns 302 back to the start', async () => {
                const removedRevisionCookies = await setSourcesIntoSession();
                if (!removedRevisionCookies) console.log('removedRevisionCookies is undefined');
                await request(app)
                    .delete('/en-GB/publish/session/currentrevision')
                    .set('User-Agent', 'supertest')
                    .set('Cookie', removedRevisionCookies);
                if (!removedRevisionCookies) console.log('removedRevisionCookies is undefined');
                const res = await request(app)
                    .post('/en-GB/publish/sources')
                    .set('Cookie', removedRevisionCookies)
                    .set('User-Agent', 'supertest');
                expect(res.status).toBe(302);
                expect(res.header.location).toBe(`/en-GB/publish/`);
            });

            test('No current import in the session returns 302 back to the start', async () => {
                const removedImportCookies = await setSourcesIntoSession();
                await request(app)
                    .delete('/en-GB/publish/session/currentimport')
                    .set('User-Agent', 'supertest')
                    .set('Cookie', removedImportCookies);
                const res = await request(app)
                    .post('/en-GB/publish/sources')
                    .set('Cookie', removedImportCookies)
                    .set('User-Agent', 'supertest');
                expect(res.status).toBe(302);
                expect(res.header.location).toBe(`/en-GB/publish/`);
            });

            test('The current import has no session on it returns 302 back to the start', async () => {
                const removedImportCookies = await setDatasetToSession();
                const res = await request(app)
                    .post('/en-GB/publish/sources')
                    .set('Cookie', removedImportCookies)
                    .set('User-Agent', 'supertest');
                expect(res.status).toBe(302);
                expect(res.header.location).toBe(`/en-GB/publish`);
            });
        });
    });

    describe('Tasklist', () => {
        test('It loads the dataset', async () => {
            const cookies = await setSourcesIntoSession();
            const res = await request(app)
                .get(`/en-GB/publish/5caeb8ed-ea64-4a58-8cf0-b728308833e5/tasklist`)
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('publish.tasklist.heading'));
            expect(res.text).toContain('test dataset 1');
            expect(res.text).toContain(t('publish.tasklist.data.datatable'));
            expect(res.text).toContain(t('publish.tasklist.metadata.update_frequency'));
            expect(res.text).toContain(t('publish.tasklist.publishing.when'));
        });

        test('It throws a 404 if the dataset id is invalid', async () => {
            const cookies = await setSourcesIntoSession();
            const res = await request(app)
                .get(`/en-GB/publish/not-a-dataset-uuid/tasklist`)
                .set('User-Agent', 'supertest')
                .set('Cookie', cookies);
            expect(res.status).toBe(404);
            expect(res.text).toContain(t('errors.not_found'));
        });
    });
});
