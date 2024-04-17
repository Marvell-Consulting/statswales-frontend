import path from 'path';
import * as fs from 'fs';

import request from 'supertest';

import { DataLakeService } from '../src/controllers/datalake';
import app, { connectToDb } from '../src/app';
import { Datafile } from '../src/entity/Datafile';

import { datasourceOptions } from './test-data-source';

DataLakeService.prototype.listFiles = jest
    .fn()
    .mockReturnValue([{ name: 'test-data-1.csv', path: 'test/test-data-1.csv', isDirectory: false }]);

DataLakeService.prototype.uploadFile = jest.fn();

beforeAll(async () => {
    await connectToDb(datasourceOptions);
    const datafile1 = new Datafile();
    datafile1.name = 'test-data-1.csv';
    datafile1.description = 'Test Data File 1';
    datafile1.id = 'bdc40218-af89-424b-b86e-d21710bc92f1';
    await datafile1.save();
    const datafile2 = new Datafile();
    datafile2.name = 'test-data-2.csv';
    datafile2.description = 'Test Data File 2';
    datafile2.id = 'fa07be9d-3495-432d-8c1f-d0fc6daae359';
    await datafile2.save();
    console.log(`Datafile created: ${Datafile.find()}`);
});

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
        const datafile = (await Datafile.findOneBy({ name: 'test-data-3.csv' })) || new Datafile();
        expect(res.header.location).toBe(`/en-GB/data/?file=${datafile.id}`);
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
            notes: 'Expand endpoint to check for database connection and other services.'
        });
    });

    test('Check list endpoint returns a list of files', async () => {
        const res = await request(app).get('/en-GB/list');
        expect(res.status).toBe(200);
        expect(res.text).toContain('test-data-1.csv');
    });

    test('Data is rendered in the frontend', async () => {
        const testFile2 = path.resolve(__dirname, `./test-data-2.csv`);
        const testFile2Buffer = fs.readFileSync(testFile2);
        DataLakeService.prototype.downloadFile = jest.fn().mockReturnValue(testFile2Buffer);

        const res = await request(app).get('/en-GB/data?file=fa07be9d-3495-432d-8c1f-d0fc6daae359');
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
        const res = await request(app).get('/en-GB/data');
        expect(res.status).toBe(400);
        expect(res.text).toContain('There is a problem');
        expect(res.text).toContain('No filename provided');
    });
});
