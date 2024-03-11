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
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);

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

    test('Upload returns 400 if page_number is too high', async () => {
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);

        const res = await request(app).post('/api/csv').attach('csv', csvfile).query({ page_number: 2 });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            success: false,
            page_size: undefined,
            current_page: undefined,
            total_pages: undefined,
            headers: undefined,
            data: undefined,
            errors: [
                {
                    field: 'page_number',
                    message: 'Page number must be less than or equal to 1'
                }
            ]
        });
    });

    test('Upload returns 400 if page_size is too high', async () => {
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);

        const res = await request(app).post('/api/csv').attach('csv', csvfile).query({ page_size: 1000 });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            success: false,
            page_size: undefined,
            current_page: undefined,
            total_pages: undefined,
            headers: undefined,
            data: undefined,
            errors: [
                {
                    field: 'page_size',
                    message: 'Page size must be between 5 and 500'
                }
            ]
        });
    });

    test('Upload returns 400 if page_number is too low', async () => {
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);

        const res = await request(app).post('/api/csv').attach('csv', csvfile).query({ page_number: -1 });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            success: false,
            page_size: undefined,
            current_page: undefined,
            total_pages: undefined,
            headers: undefined,
            data: undefined,
            errors: [
                {
                    field: 'page_number',
                    message: 'Page number must be greater than 0'
                }
            ]
        });
    });

    test('Uload returns correct page data on big dataset', async () => {
        const csvfile = path.resolve(__dirname, `./test-data-2.csv`);
        const res = await request(app)
            .post('/api/csv')
            .attach('csv', csvfile)
            .query({ page_number: 2, page_size: 100 });
        expect(res.status).toBe(200);
        expect(res.body.current_page).toBe(2);
        expect(res.body.total_pages).toBe(6);
        expect(res.body.page_size).toBe(100);
        expect(res.body.headers).toEqual(['ID', 'Text', 'Number', 'Date']);
        expect(res.body.data[0]).toEqual(['101', 'GEYiRzLIFM', '774477', '2002-03-13']);
        expect(res.body.data[99]).toEqual(['200', 'QhBxdmrUPb', '3256099', '2026-12-17']);
    });
});
