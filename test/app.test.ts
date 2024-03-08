import path from 'path';

import request from 'supertest';

import app from '../src/app';

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

    test('Upload returns 200 if a file is attached', async () => {
        const csvfile = path.resolve(__dirname, `./test-1.csv`);

        const res = await request(app).post('/upload').attach('csv', csvfile);
        expect(res.status).toBe(200);
        expect(res.text).toContain('CSV Data');
    });

    test('Upload returns 400 and an error if no file attached', async () => {
        const res = await request(app).post('/upload');
        expect(res.status).toBe(400);
        expect(res.text).toContain('No file uploaded');
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
