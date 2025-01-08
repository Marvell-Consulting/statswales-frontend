import { DatasetDTO } from '../../src/dtos/dataset';

import { publisher1 } from './users';

export const upload: DatasetDTO = {
  id: '936c1ab4-2b33-4b13-8949-4316a156d24b',
  created_by: publisher1.id,
  created_at: new Date().toISOString(),
  revisions: [],
  datasetInfo: [{ language: 'en-GB', title: 'Test - Upload' }]
};

export const previewA: DatasetDTO = {
  id: 'fb440a0d-a4fb-40cb-b9e2-3f88659a5343',
  created_by: publisher1.id,
  created_at: new Date().toISOString(),
  revisions: [],
  datasetInfo: [{ language: 'en-GB', title: 'Test - Preview A' }]
};

export const previewB: DatasetDTO = {
  id: '01a31d4c-fffd-4db4-b4d7-36505672df3f',
  created_by: publisher1.id,
  created_at: new Date().toISOString(),
  revisions: [],
  datasetInfo: [{ language: 'en-GB', title: 'Test - Preview B' }]
};

export const sources: DatasetDTO = {
  id: 'cda9a27b-1b64-4922-b8b7-ef193b5f884e',
  created_by: publisher1.id,
  created_at: new Date().toISOString(),
  revisions: [],
  datasetInfo: [{ language: 'en-GB', title: 'Test - Sources' }]
};

export const metadataA: DatasetDTO = {
  id: '47dcdd38-57d4-405f-93ac-9db20bebcfc6',
  created_by: publisher1.id,
  created_at: new Date().toISOString(),
  revisions: [],
  datasetInfo: [{ language: 'en-GB', title: 'Test - Metadata A' }]
};

export const metadataB: DatasetDTO = {
  id: '3837564c-a901-42be-9aa6-e62232150ff6',
  created_by: publisher1.id,
  created_at: new Date().toISOString(),
  revisions: [],
  datasetInfo: [{ language: 'en-GB', title: 'Test - Metadata B' }]
};
