import { DatasetDTO } from '../../src/dtos/dataset';

import { publisher1 } from './users';

export const dataset1: DatasetDTO = {
  id: '936c1ab4-2b33-4b13-8949-4316a156d24b',
  created_by: publisher1.id,
  created_at: new Date().toISOString(),
  revisions: [],
  datasetInfo: [{ language: 'en-GB', title: 'Upload Test' }]
};

export const dataset2: DatasetDTO = {
  id: 'fb440a0d-a4fb-40cb-b9e2-3f88659a5343',
  created_by: publisher1.id,
  created_at: new Date().toISOString(),
  revisions: [],
  datasetInfo: [{ language: 'en-GB', title: 'Preview Test' }]
};
