import request from 'supertest';

import app from '../src/app';

describe('Test app.ts', () => {
    test('App Homepage has correct title', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
    });

    test('Inital API endpoint works', async () => {
        const res = await request(app).get('/api');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'API is available' });
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
