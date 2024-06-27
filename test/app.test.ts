import path from 'path';

import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import app, { ENGLISH, WELSH, t } from '../src/app';

jest.mock('../src/config/authenticate', () => ({
    ensureAuthenticated: (req: Request, res: Response, next: NextFunction) => next()
}));

const server = setupServer(
    http.get('http://somehost.com:3001/en-GB/dataset', () => {
        return HttpResponse.json({
            filelist: [{ internal_name: 'test-data-1.csv', id: 'bdc40218-af89-424b-b86e-d21710bc92f1' }]
        });
    }),
    http.get('http://somehost.com:3001/en-GB/dataset/missing-id/view', () => {
        return new HttpResponse(null, {
            status: 404,
            statusText: '{}'
        });
    }),
    http.get('http://somehost.com:3001/en-GB/dataset/fa07be9d-3495-432d-8c1f-d0fc6daae359/view', () => {
        return HttpResponse.json({
            success: true,
            dataset: {
                id: 'bdc40218-af89-424b-b86e-d21710bc92f1',
                code: null,
                internal_name: 'Test 1',
                title: [],
                description: [],
                creation_date: 'Thu May 30 2024 09:20:29 GMT+0100 (British Summer Time)',
                created_by: 'BetaUser',
                modification_date: 'Thu May 30 2024 09:20:29 GMT+0100 (British Summer Time)',
                modified_by: 'BetaUser',
                live: false,
                datafiles: [],
                csv_link: '/dataset/6218a8ea-03ce-4e81-9fa3-5c6a04af43ab/csv',
                xslx_link: '/dataset/6218a8ea-03ce-4e81-9fa3-5c6a04af43ab/xlsx',
                view_link: '/dataset/6218a8ea-03ce-4e81-9fa3-5c6a04af43ab/view'
            },
            current_page: 1,
            page_info: {
                total_records: 2,
                start_record: 1,
                end_record: 2
            },
            pages: [1],
            page_size: 100,
            total_pages: 6,
            headers: ['id', 'text', 'number'],
            data: [
                ['1', 'test 1', '4532'],
                ['2', 'test 2', '4348']
            ]
        });
    }),
    http.post('http://somehost.com:3001/en-GB/dataset/', async (req) => {
        const data = await req.request.formData();
        const internalName = data.get('internal_name') as string;
        if (internalName === 'test-data-3.csv fail test') {
            return HttpResponse.json({
                success: false,
                errors: [
                    {
                        field: 'csv',
                        message: [
                            { lang: ENGLISH, message: t('errors.upload.no-csv-data', { lng: ENGLISH }) },
                            { lang: WELSH, message: t('errors.upload.no-csv-data', { lng: WELSH }) }
                        ],
                        tag: { name: 'errors.upload.no-csv-data', params: {} }
                    }
                ]
            });
        }

        return HttpResponse.json({
            success: true,
            dataset: {
                id: 'bdc40218-af89-424b-b86e-d21710bc92f1',
                code: null,
                internal_name: 'Test 1',
                title: [],
                description: [],
                creation_date: 'Thu May 30 2024 09:20:29 GMT+0100 (British Summer Time)',
                created_by: 'BetaUser',
                modification_date: 'Thu May 30 2024 09:20:29 GMT+0100 (British Summer Time)',
                modified_by: 'BetaUser',
                live: false,
                datafiles: [],
                csv_link: '/dataset/6218a8ea-03ce-4e81-9fa3-5c6a04af43ab/csv',
                xslx_link: '/dataset/6218a8ea-03ce-4e81-9fa3-5c6a04af43ab/xlsx',
                view_link: '/dataset/6218a8ea-03ce-4e81-9fa3-5c6a04af43ab/view'
            }
        });
    }),
    http.get('http://somehost.com:3001/healthcheck', () => {
        return HttpResponse.json({
            status: 'App is running',
            notes: 'Expand endpoint to check for database connection and other services.'
        });
    })
);

beforeAll(() =>
    server.listen({
        onUnhandledRequest: ({ headers, method, url }) => {
            if (headers.get('User-Agent') !== 'supertest') {
                throw new Error(`Unhandled ${method} request to ${url}`);
            }
        }
    })
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Test app.ts', () => {
    test('Redirects to language when going to /', async () => {
        const res = await request(app).get('/').set('User-Agent', 'supertest');
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/en-GB');
    });

    test('Redirects to welsh when accept-header is present when going to /', async () => {
        const res = await request(app).get('/').set('Accept-Language', 'cy-GB').set('User-Agent', 'supertest');
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/cy-GB');
    });

    test('App Homepage has correct title', async () => {
        const res = await request(app).get('/en-GB').set('User-Agent', 'supertest');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Welcome to StatsWales Beta');
    });

    test('App Homepage has correct title in welsh', async () => {
        const res = await request(app).get('/cy-GB').set('User-Agent', 'supertest');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Croeso i Alffa StatsCymru');
    });

    test('Publish start page returns OK', async () => {
        const res = await request(app).get('/en-GB/publish').set('User-Agent', 'supertest');
        console.log(res.text);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Create a new dataset');
    });

    test('Publish upload page returns OK', async () => {
        const res = await request(app).get('/en-GB/publish/name').set('User-Agent', 'supertest');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Name the dataset');
    });

    test('Publish upload page returns 400 if no internal name provided', async () => {
        const res = await request(app).post('/en-GB/publish/name').set('User-Agent', 'supertest');
        expect(res.status).toBe(400);
        expect(res.text).toContain(t('errors.name_missing'));
    });

    test('Set name returns 200 with internal name', async () => {
        const res = await request(app)
            .post('/en-GB/publish/name')
            .set('User-Agent', 'supertest')
            .field('internal_name', 'test-data-3.csv');
        expect(res.status).toBe(200);
        expect(res.text).toContain('test-data-3.csv');
    });

    test('Upload returns 302 if a file is attached', async () => {
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);

        const res = await request(app)
            .post('/en-GB/publish/upload')
            .set('User-Agent', 'supertest')
            .attach('csv', csvfile)
            .field('internal_name', 'test-data-3.csv on test');
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(`/en-GB/data/?file=bdc40218-af89-424b-b86e-d21710bc92f1`);
    });

    test('Upload returns 400 and an error if no internal name provided', async () => {
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);

        const res = await request(app)
            .post('/en-GB/publish/upload')
            .set('User-Agent', 'supertest')
            .attach('csv', csvfile);
        expect(res.status).toBe(400);
        expect(res.text).toContain(t('errors.name_missing'));
    });

    test('Upload returns 400 and an error if no file attached', async () => {
        const res = await request(app)
            .post('/en-GB/publish/upload')
            .set('User-Agent', 'supertest')
            .field('internal_name', 'test-data-3.csv');
        expect(res.status).toBe(400);
        expect(res.text).toContain('No CSV data available');
    });

    test('Uload returns 400 if API says upload was not a success', async () => {
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);

        const res = await request(app)
            .post('/en-GB/publish/upload')
            .set('User-Agent', 'supertest')
            .attach('csv', csvfile)
            .field('internal_name', 'test-data-3.csv fail test');
        expect(res.status).toBe(400);
        expect(res.text).toContain(t('errors.upload.no-csv-data'));
    });

    test('Check inital healthcheck endpoint works', async () => {
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

    test('Check list endpoint returns a list of files', async () => {
        const res = await request(app).get('/en-GB/list').set('User-Agent', 'supertest');
        expect(res.status).toBe(200);
        expect(res.text).toContain('test-data-1.csv');
    });

    test('Data is rendered in the frontend', async () => {
        const res = await request(app)
            .get('/en-GB/data/fa07be9d-3495-432d-8c1f-d0fc6daae359')
            .set('User-Agent', 'supertest');
        expect(res.status).toBe(200);
        // Header
        expect(res.text).toContain(`<th scope="col" class="govuk-table__header">
                                        id
                                    </th>`);
        expect(res.text).toContain(`<th scope="col" class="govuk-table__header">
                                        text
                                    </th>`);
        expect(res.text).toContain(`<th scope="col" class="govuk-table__header">
                                        number
                                    </th>`);
        // First Row
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            1
                                        </td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            test 1
                                        </td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            4532
                                        </td>`);
        // Last Row
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            2
                                        </td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            test 2
                                        </td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            4348
                                        </td>`);
        expect(res.text).toContain('Showing lines 1 - 2 of 2');
    });

    test('Data display returns 404 if no file available', async () => {
        const res = await request(app).get('/en-GB/data/missing-id').set('User-Agent', 'supertest');
        expect(res.status).toBe(404);
        expect(res.text).toContain(t('errors.problem'));
        expect(res.text).toContain(t('errors.dataset_missing'));
    });
});
