import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import { DatasetListItemDTO } from '../../src/dtos/dataset-list-item';

import {
  datasets,
  datasetWithTitle,
  datasetView,
  completedDataset,
  datasetRevWithNoImports,
  tasklistInProgress,
  datasetWithImport
} from './fixtures';

export const mockBackend = setupServer(
  http.get('http://example.com:3001/dataset/active', () => {
    const datasets: DatasetListItemDTO[] = [
      { id: '5caeb8ed-ea64-4a58-8cf0-b728308833e5', title: 'test dataset 1' },
      { id: 'cd7fbb99-44c8-4999-867c-e9b6abe3fe43', title: 'test dataset 2' }
    ];
    return HttpResponse.json({ datasets });
  }),

  http.get('http://example.com:3001/dataset/missing-id/view', () => {
    return new HttpResponse(null, { status: 404 });
  }),

  http.get('http://example.com:3001/dataset/:datasetId', (req) => {
    return HttpResponse.json(datasets.find((dataset) => dataset.id === req.params.datasetId));
  }),

  http.patch(`http://example.com:3001/dataset/${completedDataset.id}/info`, (req) => {
    return HttpResponse.json(completedDataset);
  }),

  http.get(`http://example.com:3001/dataset/${completedDataset.id}/tasklist`, (req) => {
    return HttpResponse.json(tasklistInProgress);
  }),

  http.get('http://example.com:3001/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/view', () => {
    return HttpResponse.json(datasetView);
  }),

  http.get(
    `http://example.com:3001/dataset/${datasetWithImport.id}/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/fact-table/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953/preview`,
    () => {
      return HttpResponse.json(datasetView);
    }
  ),

  http.get(
    'http://example.com:3001/dataset/e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18/revision/by-id/19e34cf5-be3b-4a9c-8980-f4e7346815fc/fact-table/by-id/2a44a4b2-d631-4b60-843b-705e29beaad2/preview',
    () => {
      return new HttpResponse(null, { status: 404 });
    }
  ),

  http.post('http://example.com:3001/dataset', async (req) => {
    return HttpResponse.json(datasetWithTitle);
  }),

  http.post('http://example.com:3001/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/data', async (req) => {
    return HttpResponse.json(datasetWithTitle);
  }),

  http.post(
    'http://example.com:3001/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/fact-table',
    async (req) => {
      await req.request.formData();
      return HttpResponse.json(datasetWithTitle);
    }
  ),

  http.patch(
    `http://example.com:3001/dataset/${datasetWithImport.id}/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/fact-table/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953/confirm`,
    () => {
      return HttpResponse.json(datasetWithImport);
    }
  ),

  http.patch(
    'http://example.com:3001/dataset/e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18/revision/by-id/19e34cf5-be3b-4a9c-8980-f4e7346815fc/fact-table/by-id/2a44a4b2-d631-4b60-843b-705e29beaad2/confirm',
    () => {
      return new HttpResponse(null, { status: 404 });
    }
  ),

  http.delete(
    'http://example.com:3001/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/fact-table/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953',
    () => {
      return HttpResponse.json(datasetRevWithNoImports);
    }
  ),

  http.patch(
    'http://example.com:3001/dataset/e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18/revision/by-id/19e34cf5-be3b-4a9c-8980-f4e7346815fc/fact-table/by-id/2a44a4b2-d631-4b60-843b-705e29beaad2/confirm',
    () => {
      return new HttpResponse(null, { status: 500 });
    }
  ),

  http.delete(
    'http://example.com:3001/dataset/e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18/revision/by-id/19e34cf5-be3b-4a9c-8980-f4e7346815fc/fact-table/by-id/2a44a4b2-d631-4b60-843b-705e29beaad2',
    () => {
      return new HttpResponse(null, { status: 500 });
    }
  ),

  http.patch(
    `http://example.com:3001/dataset/${datasetWithImport.id}/revision/by-id/09d1c9ac-4cea-482e-89c1-86997f3b6da6/fact-table/by-id/6a8b56ea-2fc5-4413-9dc3-4d31cbe4c953/sources`,
    () => {
      return HttpResponse.json(completedDataset);
    }
  ),

  http.patch('http://example.com:3001/dataset/5caeb8ed-ea64-4a58-8cf0-b728308833e5/info', () => {
    return HttpResponse.json(completedDataset);
  }),

  http.patch(
    'http://example.com:3001/dataset/e3e94cb8-b95d-4df8-8828-5e1d5cbe0d18/revision/by-id/19e34cf5-be3b-4a9c-8980-f4e7346815fc/fact-table/by-id/2a44a4b2-d631-4b60-843b-705e29beaad2/sources',
    () => {
      return new HttpResponse(null, { status: 500 });
    }
  ),

  http.get('http://example.com:3001/healthcheck', () => {
    return HttpResponse.json({ message: 'success' });
  })
);
