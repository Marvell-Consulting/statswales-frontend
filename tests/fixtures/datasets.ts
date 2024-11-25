import { DeepPartial } from '../../src/@types/deep-partial';
import { DatasetDTO } from '../../src/dtos/dataset';

export const dataset1: DeepPartial<DatasetDTO> = {
  id: '936c1ab4-2b33-4b13-8949-4316a156d24b',
  datasetInfo: [{ language: 'en-GB', title: 'Upload Test' }]
};

export const dataset2: DeepPartial<DatasetDTO> = {
  id: 'fb440a0d-a4fb-40cb-b9e2-3f88659a5343',
  datasetInfo: [{ language: 'en-GB', title: 'Sources Test' }]
};
