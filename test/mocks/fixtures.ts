import { DatasetDTO } from '../../src/dtos/dataset';
import { FactTableDto } from '../../src/dtos/fact-table';
import { TaskListState } from '../../src/dtos/task-list-state';
import { ViewDTO } from '../../src/dtos/view-dto';
import { TaskStatus } from '../../src/enums/task-status';

export const datasetWithTitle: DatasetDTO = {
    id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5',
    created_at: '2024-09-05T10:05:03.871Z',
    created_by: 'Test User',
    datasetInfo: [{ language: 'en-GB', title: 'Dataset with title' }],
    dimensions: [],
    revisions: []
};

export const datasetWithImport: DatasetDTO = {
    id: '7d3d49c0-9fc9-4ce2-ba48-5c466f30946c',
    created_at: '2024-09-05T10:05:03.871Z',
    created_by: 'Test User',
    datasetInfo: [{ language: 'en-GB', title: 'Dataset with import' }],
    dimensions: [],
    revisions: [
        {
            id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
            revision_index: 1,
            dataset_id: '7d3d49c0-9fc9-4ce2-ba48-5c466f30946c',
            created_at: '2024-09-05T10:05:04.052Z',
            online_cube_filename: undefined,
            publish_at: '',
            approved_at: '',
            created_by: 'Test User',
            fact_tables: [
                {
                    id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                    revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                    mime_type: 'text/csv',
                    filename: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953.csv',
                    hash: '9aa51a61d5796fbfa2ce82f62b1419d93432b1e606baf095a12daefc7c3273a5',
                    uploaded_at: '2024-09-05T10:05:03.871Z',
                    filetype: 'csv',
                    info: [
                        {
                            column_index: 0,
                            column_name: 'ID',
                            column_type: 'UNKNOWN'
                        },
                        {
                            column_index: 1,
                            column_name: 'Values',
                            column_type: 'UNKNOWN'
                        },
                        {
                            column_index: 2,
                            column_name: 'Notes',
                            column_type: 'UNKNOWN'
                        },
                        {
                            column_index: 3,
                            column_name: 'Dimension 1',
                            column_type: 'UNKNOWN'
                        },
                        {
                            column_index: 4,
                            column_name: 'Dimension 2',
                            column_type: 'UNKNOWN'
                        }
                    ]
                }
            ]
        }
    ]
};

export const datasetRevWithNoImports: DatasetDTO = {
    id: 'ccbd32ab-c8aa-4da1-a120-efd403598bf6',
    created_at: '2024-09-05T10:05:03.871Z',
    created_by: 'Test User',
    live: '',
    archive: '',
    datasetInfo: [{ language: 'en-GB', title: 'Dataset revision with no import' }],
    dimensions: [],
    revisions: [
        {
            id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
            revision_index: 1,
            dataset_id: 'ccbd32ab-c8aa-4da1-a120-efd403598bf6',
            created_at: '2024-09-05T10:05:04.052Z',
            publish_at: '',
            approved_at: '',
            created_by: 'Test User',
            fact_tables: []
        }
    ]
};

export const completedDataset: DatasetDTO = {
    id: 'ef417041-37fc-4273-8e8c-227eb4674b29',
    created_at: '2024-09-05T10:05:03.871Z',
    created_by: 'Test User',
    live: '',
    archive: '',
    datasetInfo: [{ language: 'en-GB', title: 'Completed dataset' }],
    dimensions: [],
    revisions: [
        {
            id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
            revision_index: 1,
            dataset_id: 'ef417041-37fc-4273-8e8c-227eb4674b29',
            created_at: '2024-09-05T10:05:04.052Z',
            online_cube_filename: undefined,
            publish_at: '',
            approved_at: '',
            created_by: 'Test User',
            fact_tables: [
                {
                    id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
                    revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
                    mime_type: 'text/csv',
                    filename: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953.csv',
                    hash: '9aa51a61d5796fbfa2ce82f62b1419d93432b1e606baf095a12daefc7c3273a5',
                    uploaded_at: '2024-09-05T10:05:03.871Z',
                    filetype: 'csv',
                    info: [
                        {
                            column_index: 0,
                            column_name: 'ID',
                            column_type: 'IGNORE'
                        },
                        {
                            column_index: 1,
                            column_name: 'Values',
                            column_type: 'DATAVALUES'
                        },
                        {
                            column_index: 2,
                            column_name: 'Notes',
                            column_type: 'FOOTNOTES'
                        },
                        {
                            column_index: 3,
                            column_name: 'Dimension 1',
                            column_type: 'DIMENSION'
                        },
                        {
                            column_index: 4,
                            column_name: 'Dimension 2',
                            column_type: 'DIMENSION'
                        }
                    ]
                }
            ]
        }
    ]
};

export const datasetView: ViewDTO = {
    success: true,
    dataset: {
        id: '7d3d49c0-9fc9-4ce2-ba48-5c466f30946c',
        created_at: '2024-09-05T10:05:03.871Z',
        created_by: 'Test User',
        live: '',
        archive: '',
        datasetInfo: [{ language: 'en-GB', title: 'Dataset with import' }],
        dimensions: [],
        revisions: []
    },
    fact_table: {
        id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
        revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
        mime_type: 'text/csv',
        filename: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953.csv',
        hash: '9aa51a61d5796fbfa2ce82f62b1419d93432b1e606baf095a12daefc7c3273a5',
        uploaded_at: '2024-09-05T10:05:03.871Z',
        filetype: 'csv',
        info: []
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

export const importWithDraftSources: FactTableDto = {
    id: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
    revision_id: '09d1c9ac-4cea-482e-89c1-86997f3b6da6',
    mime_type: 'text/csv',
    filename: '6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953.csv',
    hash: '9aa51a61d5796fbfa2ce82f62b1419d93432b1e606baf095a12daefc7c3273a5',
    uploaded_at: '2024-09-05T10:05:03.871Z',
    filetype: 'csv',
    info: [
        {
            column_index: 0,
            column_name: 'ID',
            column_type: 'UNKNOWN'
        },
        {
            column_index: 1,
            column_name: 'Values',
            column_type: 'UNKNOWN'
        },
        {
            column_index: 2,
            column_name: 'Notes',
            column_type: 'UNKNOWN'
        },
        {
            column_index: 3,
            column_name: 'Dimension 1',
            column_type: 'UNKNOWN'
        },
        {
            column_index: 4,
            column_name: 'Dimension 2',
            column_type: 'UNKNOWN'
        }
    ]
};

export const tasklistInProgress: TaskListState = {
    datatable: TaskStatus.Completed,
    dimensions: [],
    metadata: {
        title: TaskStatus.NotStarted,
        summary: TaskStatus.NotStarted,
        statistical_quality: TaskStatus.NotStarted,
        data_sources: TaskStatus.NotStarted,
        related_reports: TaskStatus.NotStarted,
        update_frequency: TaskStatus.NotStarted,
        designation: TaskStatus.NotStarted,
        data_collection: TaskStatus.NotStarted,
        relevant_topics: TaskStatus.NotStarted
    },
    publishing: {
        when: TaskStatus.NotStarted,
        export: TaskStatus.NotStarted,
        import: TaskStatus.NotStarted,
        submit: TaskStatus.NotStarted
    }
};

export const datasets: DatasetDTO[] = [datasetWithTitle, datasetWithImport, completedDataset, datasetRevWithNoImports];
