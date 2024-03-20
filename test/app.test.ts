import path from 'path';
import * as fs from 'fs';

import request from 'supertest';

import app from '../src/app';
import { deleteFileFromDataLake, uploadFileToDataLake } from '../src/controllers/datalake';

jest.mock('../src/controllers/datalake');

afterAll(async () => {
    await deleteFileFromDataLake('test-data-1.csv');
    await deleteFileFromDataLake('test-data-2.csv');
});

beforeEach(async () => {
    const data1 = path.resolve(__dirname, `./test-data-1.csv`);
    const data2 = path.resolve(__dirname, `./test-data-2.csv`);
    const buff1 = fs.readFileSync(data1);
    const buff2 = fs.readFileSync(data2);

    await uploadFileToDataLake('test-data-1.csv', buff1);
    await uploadFileToDataLake('test-data-2.csv', buff2);
});

afterEach(async () => {
    await deleteFileFromDataLake('test-data-1.csv');
    await deleteFileFromDataLake('test-data-2.csv');
});

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

        const res = await request(app).post('/upload').attach('csv', csvfile);
        expect(res.status).toBe(302);
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
});
