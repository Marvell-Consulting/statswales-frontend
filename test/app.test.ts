import path from 'node:path';

import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { ENGLISH, WELSH, i18next } from '../src/middleware/translation';
import app from '../src/app';
import { DatasetDTO, ImportDTO, RevisionDTO } from '../src/dtos2/dataset-dto';
import { ViewErrDTO } from '../src/dtos2/view-dto';
import { DimensionCreationDTO } from '../src/dtos2/dimension-creation-dto';

declare module 'express-session' {
    interface SessionData {
        currentDataset: DatasetDTO | undefined;
        currentRevision: RevisionDTO | undefined;
        currentImport: ImportDTO | undefined;
        errors: ViewErrDTO | undefined;
        dimensionCreationRequest: DimensionCreationDTO[];
        currentTitle: string | undefined;
    }
}

const t = i18next.t;

jest.mock('../src/middleware/ensure-authenticated', () => ({
    ensureAuthenticated: (req: Request, res: Response, next: NextFunction) => next()
}));

const server = setupServer(
    http.get('http://example.com:3001/en-GB/dataset', () => {
        return HttpResponse.json({
            filelist: [
                {
                    titles: [
                        {
                            title: 'test dataset 1',
                            language: 'en-GB'
                        }
                    ],
                    dataset_id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5'
                },
                {
                    titles: [
                        {
                            title: 'test dataset 2',
                            language: 'en-GB'
                        }
                    ],
                    dataset_id: 'cd7fbb99-44c8-4999-867c-e9b6abe3fe43'
                }
            ]
        });
    }),
    http.get('http://example.com:3001/en-GB/dataset/missing-id/view', () => {
        return new HttpResponse(null, {
            status: 404,
            statusText: '{}'
        });
    }),
    http.get('http://example.com:3001/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5', () => {
        return HttpResponse.json({
            id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
            creation_date: '2024-09-05T10:05:03.871Z',
            created_by: 'Test User',
            live: '',
            archive: '',
            datasetInfo: [
                {
                    language: 'en-GB',
                    title: 'test dataset 1',
                    description: null
                }
            ],
            dimensions: [],
            revisions: [
                {
                    id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                    revision_index: 1,
                    dataset_id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
                    creation_date: '2024-09-05T10:05:04.052Z',
                    online_cube_filename: null,
                    publish_date: '',
                    approval_date: '',
                    created_by: 'Test User',
                    imports: [
                        {
                            id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                            mime_type: 'text/csv',
                            filename: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953.csv',
                            hash: '9aa51a61d5796fbfa2ce82f62b1419d93432b1e606baf095a12daefc7c3273a5',
                            uploaded_at: '2024-09-05T10:05:03.871Z',
                            type: 'Draft',
                            location: 'BlobStorage',
                            sources: []
                        }
                    ]
                }
            ]
        });
    }),
    http.get('http://example.com:3001/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/view', () => {
        return HttpResponse.json({
            success: true,
            dataset: {
                id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
                creation_date: '2024-09-05T10:05:03.871Z',
                created_by: 'Test User',
                live: '',
                archive: '',
                datasetInfo: [
                    {
                        language: 'en-GB',
                        title: 'test dataset 1',
                        description: null
                    }
                ],
                dimensions: [],
                revisions: []
            },
            import: {
                id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                mime_type: 'text/csv',
                filename: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953.csv',
                hash: '9aa51a61d5796fbfa2ce82f62b1419d93432b1e606baf095a12daefc7c3273a5',
                uploaded_at: '2024-09-05T10:05:03.871Z',
                type: 'Draft',
                location: 'BlobStorage',
                sources: []
            },
            current_page: 1,
            page_info: {
                total_records: 2,
                start_record: 1,
                end_record: 2
            },
            pages: [1],
            page_size: 100,
            total_pages: 1,
            headers: [
                { index: 0, name: 'ID' },
                { index: 1, name: 'Text' },
                { index: 2, name: 'Number' },
                { index: 3, name: 'Date' }
            ],
            data: [
                ['1', 'test1', '3423196', '2001-09-20'],
                ['2', 'AcHVoWJblA', '4470652', '2002-03-18']
            ]
        });
    }),
    http.get(
        'http://example.com:3001/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/import/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953/preview',
        () => {
            return HttpResponse.json({
                success: true,
                dataset: {
                    id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
                    creation_date: '2024-09-05T10:05:03.871Z',
                    created_by: 'Test User',
                    live: '',
                    archive: '',
                    datasetInfo: [
                        {
                            language: 'en-GB',
                            title: 'test dataset 1',
                            description: null
                        }
                    ],
                    dimensions: [],
                    revisions: []
                },
                import: {
                    id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                    revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                    mime_type: 'text/csv',
                    filename: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953.csv',
                    hash: '9aa51a61d5796fbfa2ce82f62b1419d93432b1e606baf095a12daefc7c3273a5',
                    uploaded_at: '2024-09-05T10:05:03.871Z',
                    type: 'Draft',
                    location: 'BlobStorage',
                    sources: []
                },
                current_page: 1,
                page_info: {
                    total_records: 2,
                    start_record: 1,
                    end_record: 2
                },
                pages: [1],
                page_size: 100,
                total_pages: 1,
                headers: [
                    { index: 0, name: 'ID' },
                    { index: 1, name: 'Text' },
                    { index: 2, name: 'Number' },
                    { index: 3, name: 'Date' }
                ],
                data: [
                    ['1', 'test1', '3423196', '2001-09-20'],
                    ['2', 'AcHVoWJblA', '4470652', '2002-03-18']
                ]
            });
        }
    ),
    http.post('http://example.com:3001/en-GB/dataset/', async (req) => {
        const data = await req.request.formData();
        const title = data.get('title') as string;
        if (title === 'test-data-3.csv fail test') {
            return HttpResponse.json(
                {
                    success: false,
                    errors: [
                        {
                            field: 'csv',
                            tag: { name: 'errors.upload.no_csv_data', params: {} }
                        }
                    ]
                },
                { status: 400 }
            );
        }

        return HttpResponse.json({
            id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
            creation_date: '2024-09-05T10:05:03.871Z',
            created_by: 'Test User',
            live: '',
            archive: '',
            datasetInfo: [
                {
                    language: 'en-GB',
                    title: 'test dataset 1',
                    description: null
                }
            ],
            dimensions: [],
            revisions: [
                {
                    id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                    revision_index: 1,
                    dataset_id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
                    creation_date: '2024-09-05T10:05:04.052Z',
                    online_cube_filename: null,
                    publish_date: '',
                    approval_date: '',
                    created_by: 'Test User',
                    imports: [
                        {
                            id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                            mime_type: 'text/csv',
                            filename: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953.csv',
                            hash: '9aa51a61d5796fbfa2ce82f62b1419d93432b1e606baf095a12daefc7c3273a5',
                            uploaded_at: '2024-09-05T10:05:03.871Z',
                            type: 'Draft',
                            location: 'BlobStorage',
                            sources: []
                        }
                    ]
                }
            ]
        });
    }),
    http.get('http://example.com:3001/healthcheck', () => {
        return HttpResponse.json({
            status: 'App is running',
            notes: 'Expand endpoint to check for database connection and other services.'
        });
    })
);

beforeAll(() => {
    server.listen({
        onUnhandledRequest: ({ headers, method, url }) => {
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

afterAll(() => server.close());

describe('Test app.ts', () => {
    async function clearSession() {
        const res = await request(app).get('/en-GB/publish').set('User-Agent', 'supertest');
        return res.headers['set-cookie'];
    }

    async function setTitleToSession(title: string) {
        const res = await request(app)
            .post('/en-GB/publish/title')
            .set('User-Agent', 'supertest')
            .field('title', title);
        return res.headers['set-cookie'];
    }

    async function setDatasetToSession() {
        await clearSession();
        const cookie = await setTitleToSession('test dataset 1');
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);
        const res = await request(app)
            .post('/en-GB/publish/upload')
            .set('User-Agent', 'supertest')
            .set('Cookie', cookie)
            .attach('csv', csvfile);
        return res.headers['set-cookie'];
    }

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
        expect(res.status).toBe(200);
        expect(res.text).toContain('Create a new dataset');
    });

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

    test('Upload returns 302 if a file is attached', async () => {
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);
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
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);

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
        const csvfile = path.resolve(__dirname, `./test-data-1.csv`);
        const cookies = await setTitleToSession('test-data-3.csv fail test');
        const res = await request(app)
            .post('/en-GB/publish/upload')
            .set('User-Agent', 'supertest')
            .set('Cookie', cookies)
            .attach('csv', csvfile);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(`/en-GB/publish/`);
    });

    test('Check initial healthcheck endpoint works', async () => {
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
        const res = await request(app).get('/en-GB/dataset').set('User-Agent', 'supertest');
        expect(res.status).toBe(200);
        expect(res.text).toContain('test dataset 1');
    });

    test('Data is rendered in the frontend', async () => {
        const res = await request(app)
            .get('/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5')
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
        expect(res.text).toContain('Showing lines 1 - 2 of 2');
    });

    test('Data display returns 404 if no file available', async () => {
        const res = await request(app).get('/en-GB/dataset/missing-id').set('User-Agent', 'supertest');
        expect(res.status).toBe(404);
        expect(res.text).toContain(t('errors.problem'));
        expect(res.text).toContain(t('errors.dataset_missing'));
    });

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
});
