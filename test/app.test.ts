import path from 'path';

import request from 'supertest';

import { API } from '../src/controllers/api';
import app from '../src/app';

API.prototype.getFileList = jest.fn().mockReturnValue({
    filelist: [{ name: 'test-data-1.csv', id: 'bdc40218-af89-424b-b86e-d21710bc92f1', description: 'Test Data File 1' }]
});

API.prototype.getFileData = jest.fn().mockReturnValue({
    success: true,
    datafile_id: 'bdc40218-af89-424b-b86e-d21710bc92f1',
    datafile_name: 'Test 1',
    datafile_description: 'The first database test!',
    current_page: 1,
    page_info: {
        total_records: 2,
        start_record: 1,
        end_record: 2
    },
    pages: [1],
    page_size: 100,
    total_pages: 1,
    headers: ['id', 'text', 'number'],
    data: [
        ['1', 'test 1', '4532'],
        ['2', 'test 2', '4348']
    ]
});

API.prototype.uploadCSV = jest.fn().mockReturnValue({
    success: true,
    datafile_id: 'bdc40218-af89-424b-b86e-d21710bc92f1',
    datafile_name: 'Test 1',
    datafile_description: 'The first database test!',
    current_page: 1,
    page_info: {
        total_records: 2,
        start_record: 1,
        end_record: 2
    },
    pages: [1],
    page_size: 100,
    total_pages: 1,
    headers: ['id', 'text', 'number'],
    data: [
        ['1', 'test 1', '4532'],
        ['2', 'test 2', '4348']
    ]
});

API.prototype.ping = jest.fn().mockReturnValue(true);

describe('Test app.ts', () => {
    test('Redirects to language when going to /', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/en-GB');
    });

    test('Redirects to welsh when accept-header is present when going to /', async () => {
        const res = await request(app).get('/').set('Accept-Language', 'cy-GB');
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/cy-GB');
    });

    test('App Homepage has correct title', async () => {
        const res = await request(app).get('/en-GB');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Welcome to StatsWales Alpha');
    });

    test('App Homepage has correct title in welsh', async () => {
        const res = await request(app).get('/cy-GB');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Croeso i Alffa StatsCymru');
    });

    test('Upload page returns OK', async () => {
        const res = await request(app).get('/en-GB/upload');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Upload a CSV');
    });

    test('Upload returns 302 if a file is attached', async () => {
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);

        const res = await request(app)
            .post('/en-GB/upload')
            .attach('csv', csvfile)
            .field('filename', 'test-data-3.csv')
            .field('description', 'Test Data File 3');
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(`/en-GB/data/?file=bdc40218-af89-424b-b86e-d21710bc92f1`);
    });

    test('Upload returns 400 and an error if no file attached', async () => {
        const res = await request(app).post('/en-GB/upload');
        expect(res.status).toBe(400);
        expect(res.text).toContain('No CSV data available');
    });

    test('Check inital healthcheck endpoint works', async () => {
        const res = await request(app).get('/healthcheck');
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
        const res = await request(app).get('/en-GB/list');
        expect(res.status).toBe(200);
        expect(res.text).toContain('test-data-1.csv');
    });

    test('Data is rendered in the frontend', async () => {
        const res = await request(app).get('/en-GB/data?file=fa07be9d-3495-432d-8c1f-d0fc6daae359');
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
        const res = await request(app).get('/en-GB/data');
        expect(res.status).toBe(400);
        expect(res.text).toContain('There is a problem');
        expect(res.text).toContain('No filename provided');
    });
});
