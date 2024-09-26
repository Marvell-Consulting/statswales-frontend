import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import { DatasetDTO } from '../../src/dtos2/dataset-dto';

export const createdDataset: DatasetDTO = {
    id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
    creation_date: '2024-09-05T10:05:03.871Z',
    created_by: 'Test User',
    live: '',
    archive: '',
    datasetInfo: [
        {
            language: 'en-GB',
            title: 'test dataset 1',
            description: undefined
        }
    ],
    dimensions: [],
    revisions: [
        {
            id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
            revision_index: 1,
            dataset_id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
            creation_date: '2024-09-05T10:05:04.052Z',
            online_cube_filename: undefined,
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
};

const brokenPreviewDataset: DatasetDTO = {
    id: 'e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18',
    creation_date: '2024-09-05T10:05:03.871Z',
    created_by: 'Test User',
    live: '',
    archive: '',
    datasetInfo: [
        {
            language: 'en-GB',
            title: 'test dataset 1',
            description: undefined
        }
    ],
    dimensions: [],
    revisions: [
        {
            id: '19e34cf5-be3b-4a9c-8980-f4e7346815fc',
            revision_index: 1,
            dataset_id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
            creation_date: '2024-09-05T10:05:04.052Z',
            online_cube_filename: undefined,
            publish_date: '',
            approval_date: '',
            created_by: 'Test User',
            imports: [
                {
                    id: '2a44a4b2-d631-4b60-843b-705e29beaad2',
                    revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                    mime_type: 'text/csv',
                    filename: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953.csv',
                    hash: '9aa51a61d5796fbfa2ce82f62b1419d93432b1e606baf095a12daefc7c3273a5',
                    uploaded_at: '2024-09-05T10:05:03.871Z',
                    type: 'Draft',
                    location: 'BlobStorage',
                    sources: [
                        {
                            id: 'fea70d3f-beb9-491c-83fb-3fae2daa1702',
                            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                            column_index: 0,
                            csv_field: 'ID',
                            action: 'IGNORE',
                            type: 'IGNORE'
                        }
                    ]
                }
            ]
        }
    ]
};

export const completedDataset: DatasetDTO = {
    id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
    creation_date: '2024-09-05T10:05:03.871Z',
    created_by: 'Test User',
    live: '',
    archive: '',
    datasetInfo: [
        {
            language: 'en-GB',
            title: 'test dataset 1',
            description: undefined
        }
    ],
    dimensions: [],
    revisions: [
        {
            id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
            revision_index: 1,
            dataset_id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
            creation_date: '2024-09-05T10:05:04.052Z',
            online_cube_filename: undefined,
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
                    sources: [
                        {
                            id: 'fea70d3f-beb9-491c-83fb-3fae2daa1702',
                            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                            column_index: 0,
                            csv_field: 'ID',
                            action: 'IGNORE',
                            type: 'IGNORE'
                        },
                        {
                            id: '195e44f0-0bf2-40ea-8567-8e7f5dc96054',
                            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                            column_index: 1,
                            csv_field: 'Values',
                            action: 'CREATE',
                            type: 'DATAVALUES'
                        },
                        {
                            id: 'd5f8a827-9f6d-4b37-974d-cdfcb3380032',
                            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                            column_index: 2,
                            csv_field: 'Notes',
                            action: 'CREATE',
                            type: 'FOOTNOTES'
                        },
                        {
                            id: '32894949-e758-4974-a932-455d51895293',
                            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                            column_index: 3,
                            csv_field: 'Dimension 1',
                            action: 'CREATE',
                            type: 'DIMENSION'
                        },
                        {
                            id: '8b2ef050-fe84-4150-b124-f993a5e56dc3',
                            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                            column_index: 4,
                            csv_field: 'Dimension 2',
                            action: 'CREATE',
                            type: 'DIMENSION'
                        }
                    ]
                }
            ]
        }
    ]
};

export const datasetView = {
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
};

export const importWithDraftSources = {
    id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
    revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
    mime_type: 'text/csv',
    filename: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953.csv',
    hash: '9aa51a61d5796fbfa2ce82f62b1419d93432b1e606baf095a12daefc7c3273a5',
    uploaded_at: '2024-09-05T10:05:03.871Z',
    type: 'Draft',
    location: 'BlobStorage',
    sources: [
        {
            id: 'fea70d3f-beb9-491c-83fb-3fae2daa1702',
            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
            column_index: 0,
            csv_field: 'ID',
            action: 'UNKNOWN',
            type: 'UNKNOWN'
        },
        {
            id: '195e44f0-0bf2-40ea-8567-8e7f5dc96054',
            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
            column_index: 1,
            csv_field: 'Values',
            action: 'UNKNOWN',
            type: 'UNKNOWN'
        },
        {
            id: 'd5f8a827-9f6d-4b37-974d-cdfcb3380032',
            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
            column_index: 2,
            csv_field: 'Notes',
            action: 'UNKNOWN',
            type: 'UNKNOWN'
        },
        {
            id: '32894949-e758-4974-a932-455d51895293',
            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
            column_index: 3,
            csv_field: 'Dimension 1',
            action: 'UNKNOWN',
            type: 'UNKNOWN'
        },
        {
            id: '8b2ef050-fe84-4150-b124-f993a5e56dc3',
            import_id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
            revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
            column_index: 4,
            csv_field: 'Dimension 2',
            action: 'UNKNOWN',
            type: 'UNKNOWN'
        }
    ]
};

export const revisionWithNoImports = {
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
            imports: []
        }
    ]
};

export const server = setupServer(
    http.get('http://example.com:3001/en-GB/dataset/active', () => {
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
        return HttpResponse.json(createdDataset);
    }),
    http.get('http://example.com:3001/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/view', () => {
        return HttpResponse.json(datasetView);
    }),
    http.get(
        'http://example.com:3001/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/import/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953/preview',
        () => {
            return HttpResponse.json(datasetView);
        }
    ),
    http.get(
        'http://example.com:3001/en-GB/dataset/e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18/revision/by-id/19e34cf5-be3b-4a9c-8980-f4e7346815fc/import/by-id/2a44a4b2-d631-4b60-843b-705e29beaad2/preview',
        () => {
            return new HttpResponse(null, {
                status: 404,
                statusText: '{}'
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
        if (title === 'test-data-4.csv broken preview') {
            return HttpResponse.json(brokenPreviewDataset);
        }

        return HttpResponse.json(createdDataset);
    }),
    http.post(
        'http://example.com:3001/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/import',
        async (req) => {
            await req.request.formData();
            return HttpResponse.json(createdDataset);
        }
    ),
    http.patch(
        'http://example.com:3001/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/import/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953/confirm',
        () => {
            return HttpResponse.json(importWithDraftSources);
        }
    ),
    http.patch(
        'http://example.com:3001/en-GB/dataset/e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18/revision/by-id/19e34cf5-be3b-4a9c-8980-f4e7346815fc/import/by-id/2a44a4b2-d631-4b60-843b-705e29beaad2/confirm',
        () => {
            return new HttpResponse(null, {
                status: 404,
                statusText: '{}'
            });
        }
    ),
    http.delete(
        'http://example.com:3001/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/import/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
        () => {
            return HttpResponse.json(revisionWithNoImports);
        }
    ),
    http.patch(
        'http://example.com:3001/en-GB/dataset/e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18/revision/by-id/19e34cf5-be3b-4a9c-8980-f4e7346815fc/import/by-id/2a44a4b2-d631-4b60-843b-705e29beaad2/confirm',
        () => {
            return new HttpResponse(null, {
                status: 500,
                statusText: '{}'
            });
        }
    ),
    http.delete(
        'http://example.com:3001/en-GB/dataset/e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18/revision/by-id/19e34cf5-be3b-4a9c-8980-f4e7346815fc/import/by-id/2a44a4b2-d631-4b60-843b-705e29beaad2',
        () => {
            return new HttpResponse(null, {
                status: 500,
                statusText: '{}'
            });
        }
    ),
    http.patch(
        'http://example.com:3001/en-GB/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/import/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953/sources',
        () => {
            return HttpResponse.json(completedDataset);
        }
    ),
    http.patch(
        'http://example.com:3001/en-GB/dataset/e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18/revision/by-id/19e34cf5-be3b-4a9c-8980-f4e7346815fc/import/by-id/2a44a4b2-d631-4b60-843b-705e29beaad2/sources',
        () => {
            return new HttpResponse(null, {
                status: 500,
                statusText: '{}'
            });
        }
    ),
    http.get('http://example.com:3001/healthcheck', () => {
        return HttpResponse.json({
            status: 'App is running',
            notes: 'Expand endpoint to check for database connection and other services.'
        });
    })
);
