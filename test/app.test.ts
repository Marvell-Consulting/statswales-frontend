import path from 'path';
import * as fs from 'fs';

import request from 'supertest';

import app from '../src/app';
import { DataLakeService } from '../src/controllers/datalake';

DataLakeService.prototype.listFiles = jest
    .fn()
    .mockReturnValue([{ name: 'test-data-1.csv', path: 'test/test-data-1.csv', isDirectory: false }]);

DataLakeService.prototype.uploadFile = jest.fn();

describe('Test app.ts', () => {
    test('App Homepage has correct title', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Welcome to StatsWales Alpha');
    });

    test('Upload page returns OK', async () => {
        const res = await request(app).get('/upload');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Upload a CSV');
    });

    test('Upload returns 302 if a file is attached', async () => {
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);

        const res = await request(app).post('/upload').attach('csv', csvfile).field('filename', 'test-data-1.csv');
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/data/?file=test-data-1.csv');
    });

    test('Upload returns 400 and an error if no file attached', async () => {
        const res = await request(app).post('/upload');
        expect(res.status).toBe(400);
        expect(res.text).toContain('No CSV data available');
    });

    test('Check inital healthcheck endpoint works', async () => {
        const res = await request(app).get('/healthcheck');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: 'App is running',
            notes: 'Expand endpoint to check for database connection and other services.'
        });
    });

    test('Check list endpoint returns a list of files', async () => {
        const res = await request(app).get('/list');
        expect(res.status).toBe(200);
        expect(res.text).toContain('test-data-1.csv');
    });

    test('Data is rendered in the frontend', async () => {
        const testFile2 = path.resolve(__dirname, `./test-data-2.csv`);
        const testFile2Buffer = fs.readFileSync(testFile2);
        DataLakeService.prototype.downloadFile = jest.fn().mockReturnValue(testFile2Buffer);

        const res = await request(app).get('/data?file=test-data-2.csv');
        expect(res.status).toBe(200);
        // Header
        expect(res.text).toContain(`<th scope="col" class="govuk-table__header">
                                        ID
                                    </th>`);
        expect(res.text).toContain(`<th scope="col" class="govuk-table__header">
                                        Text
                                    </th>`);
        expect(res.text).toContain(`<th scope="col" class="govuk-table__header">
                                        Number
                                    </th>`);
        expect(res.text).toContain(`<th scope="col" class="govuk-table__header">
                                        Date
                                    </th>`);
        // First Row
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            1
                                        </td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            POhktwecbL
                                        </td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            3423196
                                        </td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            2001-09-20
                                        </td>`);
        // Last Row
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            100
                                        </td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            zOSNweHXNo
                                        </td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            1397900
                                        </td>`);
        expect(res.text).toContain(`<td class="govuk-table__cell">
                                            2026-11-17
                                        </td>`);
        expect(res.text).toContain('Showing lines 1 - 100 of 512');
    });

    test('Data display returns 404 if no file available', async () => {
        const res = await request(app).get('/data');
        expect(res.status).toBe(400);
        expect(res.text).toContain('There is a problem');
        expect(res.text).toContain('No filename provided');
    });
});
