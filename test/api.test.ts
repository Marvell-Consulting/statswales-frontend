import path from 'path';

import request from 'supertest';

import app from '../src/app';

describe('API Endpoints', () => {
    test('Inital API endpoint works', async () => {
        const res = await request(app).get('/api');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'API is available' });
    });

    test('Upload returns 400 if no file attached', async () => {
        const res = await request(app).post('/api/csv');
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            success: false,
            headers: undefined,
            data: undefined,
            errors: [
                {
                    field: 'csv',
                    message: 'No file uploaded'
                }
            ]
        });
    });

    test('Upload returns 200 if a file is attached', async () => {
        const csvfile = path.resolve(__dirname, `./test-1.csv`);

        const res = await request(app).post('/api/csv').attach('csv', csvfile);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            current_page: 1,
            page_size: 100,
            total_pages: 1,
            headers: ['id', 'text', 'number'],
            data: [
                ['1', 'test 1', '4532'],
                ['2', 'test 2', '4348']
            ],
            errors: undefined
        });
    });
});
