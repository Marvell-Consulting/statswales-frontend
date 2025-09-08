import { randomUUID } from 'node:crypto';

import { appConfig } from '../src/shared/config';
import { HttpMethod } from '../src/shared/enums/http-method';
import { Locale } from '../src/shared/enums/locale';
import { SourceType } from '../src/shared/enums/source-type';
import { ApiException } from '../src/shared/exceptions/api.exception';
import { ViewException } from '../src/shared/exceptions/view.exception';
import { SourceAssignmentDTO } from '../src/shared/dtos/source-assignment-dto';
import { DatasetListItemDTO } from '../src/shared/dtos/dataset-list-item';
import { PublisherApi } from '../src/publisher/services/publisher-api';
import { UnknownException } from '../src/shared/exceptions/unknown.exception';

describe('PublisherApi', () => {
  let statsWalesApi: PublisherApi;
  let fetchSpy: jest.SpyInstance;
  let mockResponse: Promise<Response>;

  const config = appConfig();
  const baseUrl = config.backend.url;
  const token = 'thisissomemadeupjwt';

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const headers = { 'Accept-Language': 'en' };

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => mockResponse);
    statsWalesApi = new PublisherApi();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authorization', () => {
    it('should include an Authorization header when a token is provided', async () => {
      statsWalesApi = new PublisherApi(Locale.English, token);
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));

      await statsWalesApi.ping();

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/healthcheck`, {
        method: HttpMethod.Get,
        headers: { ...headers, Authorization: `Bearer ${token}` }
      });
    });
  });

  describe('Error handling', () => {
    it('should throw an UnknownException when the backend is unreachable', async () => {
      mockResponse = Promise.reject(new Error('Service Unavailable'));
      await expect(statsWalesApi.fetch({ url: 'example.com/api' })).rejects.toThrow(
        new UnknownException('Service Unavailable')
      );
    });

    it('should throw an ApiException when the backend returns a 500', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
      await expect(statsWalesApi.fetch({ url: 'example.com/api' })).rejects.toThrow(
        new ApiException('Internal Server Error', 500)
      );
    });

    it('should throw an ApiException when the backend returns a 400', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 400, statusText: 'Bad Request' }));
      await expect(statsWalesApi.fetch({ url: 'example.com/api' })).rejects.toThrow(
        new ApiException('Bad Request', 400)
      );
    });

    it('should throw an ApiException when the backend returns a 404', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
      await expect(statsWalesApi.fetch({ url: 'example.com/api' })).rejects.toThrow(new ApiException('Not Found', 400));
    });
  });

  describe('getUserDatasetList', () => {
    it('should return an array of DatasetListItemDTO', async () => {
      const list: DatasetListItemDTO[] = [
        { id: randomUUID(), title: 'Example 1' },
        { id: randomUUID(), title: 'Example 2' }
      ];

      mockResponse = Promise.resolve(new Response(JSON.stringify(list)));

      const response = await statsWalesApi.getUserDatasetList();
      expect(response).toEqual(list);
    });
  });

  describe('getOriginalUpload', () => {
    it('should return a ReadableStream', async () => {
      const datasetId = randomUUID();
      const revisionId = randomUUID();
      const stream = new ReadableStream();

      mockResponse = Promise.resolve(new Response(stream));

      const fileStream = await statsWalesApi.getOriginalUpload(datasetId, revisionId);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/data-table/raw`,
        { method: HttpMethod.Get, headers }
      );
      expect(fileStream).toBe(stream);
    });
  });

  describe('confirmDataTable', () => {
    it('should return a DataTableDTO', async () => {
      const datasetId = randomUUID();
      const revisionId = randomUUID();
      const importId = randomUUID();
      const dataTable = { dataset_id: datasetId, revision_id: revisionId, import_id: importId };

      mockResponse = Promise.resolve(new Response(JSON.stringify(dataTable)));

      const dataTableDTO = await statsWalesApi.confirmDataTable(datasetId, revisionId);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/data-table/confirm`,
        { method: HttpMethod.Patch, headers }
      );
      expect(dataTableDTO).toEqual(dataTable);
    });
  });

  describe('getSourcesForDataset', () => {
    it('should return an array of FactTableColumnDto', async () => {
      const datasetId = randomUUID();
      const revisionId = randomUUID();
      const importId = randomUUID();
      const dataTable = { dataset_id: datasetId, revision_id: revisionId, import_id: importId };

      mockResponse = Promise.resolve(new Response(JSON.stringify(dataTable)));

      const factTableColumnDto = await statsWalesApi.getSourcesForDataset(datasetId);

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/dataset/${datasetId}/sources`, {
        method: HttpMethod.Get,
        headers
      });
      expect(factTableColumnDto).toEqual(dataTable);
    });
  });

  describe('getDataset', () => {
    it('should return a DatasetDTO', async () => {
      const datasetId = randomUUID();
      const dataset = { id: datasetId, title: 'Example Dataset' };

      mockResponse = Promise.resolve(new Response(JSON.stringify(dataset)));

      const datasetDTO = await statsWalesApi.getDataset(datasetId);

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/dataset/${datasetId}`, {
        method: HttpMethod.Get,
        headers
      });
      expect(datasetDTO).toEqual(dataset);
    });
  });

  describe('getDatasetView', () => {
    it('should return a ViewDTO', async () => {
      const datasetId = randomUUID();
      const view = { dataset_id: datasetId, page_number: 1, page_size: 10 };

      mockResponse = Promise.resolve(new Response(JSON.stringify(view)));

      const viewDTO = await statsWalesApi.getDatasetView(datasetId, 1, 10);

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/dataset/${datasetId}/view?page_number=1&page_size=10`, {
        method: HttpMethod.Get,
        headers
      });
      expect(viewDTO).toEqual(view);
    });

    it('should throw an exception when the backend returns an error', async () => {
      const datasetId = randomUUID();
      mockResponse = Promise.reject(new Response(null, { status: 400, statusText: 'Bad Request' }));

      await expect(statsWalesApi.getDatasetView(datasetId, 1, 10)).rejects.toThrow();
    });
  });

  describe('getImportPreview', () => {
    it('should return a ViewDTO', async () => {
      const datasetId = randomUUID();
      const revisionId = randomUUID();
      const importId = randomUUID();

      const view = {
        dataset_id: datasetId,
        revision_id: revisionId,
        import_id: importId,
        page_number: 1,
        page_size: 10
      };

      mockResponse = Promise.resolve(new Response(JSON.stringify(view)));

      const viewDTO = await statsWalesApi.getImportPreview(datasetId, revisionId, 1, 10);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/data-table/preview?page_number=1&page_size=10`,
        {
          method: HttpMethod.Get,
          headers
        }
      );
      expect(viewDTO).toEqual(view);
    });

    it('should throw an exception when the backend returns an error', async () => {
      const datasetId = randomUUID();
      const revisionId = randomUUID();

      mockResponse = Promise.reject(new Response(null, { status: 400, statusText: 'Bad Request' }));

      await expect(statsWalesApi.getImportPreview(datasetId, revisionId, 1, 10)).rejects.toThrow();
    });
  });

  describe('uploadCSVtoCreateDataset', () => {
    it('should return a DatasetDTO', async () => {
      const file = new Blob([JSON.stringify({ foo: 'bar' })]);
      const filename = 'example.csv';
      const title = 'Example Dataset';
      const dataset = { id: randomUUID(), title };

      const body = new FormData();
      body.set('csv', file, filename);
      body.set('title', title);

      mockResponse = Promise.resolve(new Response(JSON.stringify(dataset)));

      const datasetDTO = await statsWalesApi.uploadCSVtoCreateDataset(file, filename, title);

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/dataset`, {
        method: HttpMethod.Post,
        headers,
        body
      });
      expect(datasetDTO).toEqual(dataset);
    });

    it('should throw a ViewException when the backend returns an error', async () => {
      const file = new Blob([JSON.stringify({ foo: 'bar' })]);
      const filename = 'example.csv';
      const title = 'Example Dataset';

      const body = new FormData();
      body.set('csv', file, filename);
      body.set('title', title);

      mockResponse = Promise.resolve(new Response(null, { status: 400, statusText: 'Bad Request' }));

      await expect(statsWalesApi.uploadCSVtoCreateDataset(file, filename, title)).rejects.toThrow(
        new ViewException('Bad Request', 400, [
          {
            field: 'csv',
            message: {
              key: 'errors.upload.no_csv_data',
              params: {}
            }
          }
        ])
      );
    });
  });

  describe('sendCreateDimensionRequest', () => {
    it('should return a DatasetDTO', async () => {
      const datasetId = randomUUID();

      const sourceAssignment: SourceAssignmentDTO[] = [
        { column_index: 0, column_name: randomUUID(), column_type: SourceType.Dimension },
        { column_index: 1, column_name: randomUUID(), column_type: SourceType.DataValues }
      ];

      const dataset = { id: datasetId, title: 'Example Dataset' };

      mockResponse = Promise.resolve(new Response(JSON.stringify(dataset)));

      const datasetDTO = await statsWalesApi.assignSources(datasetId, sourceAssignment);

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/dataset/${datasetId}/sources`, {
        method: HttpMethod.Patch,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { ...headers, 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(sourceAssignment)
      });
      expect(datasetDTO).toEqual(dataset);
    });
  });

  describe('uploadCSVToFixDataset', () => {
    it('should return a DatasetDTO', async () => {
      const datasetId = randomUUID();
      const revisionId = randomUUID();
      const file = new Blob([JSON.stringify({ foo: 'bar' })]);
      const filename = 'example.csv';
      const dataset = { id: datasetId, title: 'Example Dataset' };

      const body = new FormData();
      body.set('csv', file, filename);

      mockResponse = Promise.resolve(new Response(JSON.stringify(dataset)));

      const datasetDTO = await statsWalesApi.uploadCSVToFixDataset(datasetId, revisionId, file, filename);

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/fact-table`, {
        method: HttpMethod.Post,
        headers,
        body
      });
      expect(datasetDTO).toEqual(dataset);
    });

    it('should throw a ViewException when the backend returns an error', async () => {
      const datasetId = randomUUID();
      const revisionId = randomUUID();
      const file = new Blob([JSON.stringify({ foo: 'bar' })]);
      const filename = 'example.csv';

      const body = new FormData();
      body.set('csv', file, filename);

      mockResponse = Promise.resolve(new Response(null, { status: 400, statusText: 'Bad Request' }));

      await expect(statsWalesApi.uploadCSVToFixDataset(datasetId, revisionId, file, filename)).rejects.toThrow(
        new ViewException('Bad Request', 400, [
          {
            field: 'csv',
            message: {
              key: 'errors.upload.no_csv_data',
              params: {}
            }
          }
        ])
      );
    });
  });

  describe('ping', () => {
    it('should return true when the backend is reachable', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));

      const ping = await statsWalesApi.ping();

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/healthcheck`, { method: HttpMethod.Get, headers });
      expect(ping).toBe(true);
    });

    it('should throw an exception when the backend is unreachable', async () => {
      mockResponse = Promise.reject(new Error('Service Unavailable'));

      await expect(statsWalesApi.ping()).rejects.toThrow(new ApiException('Service Unavailable', 503));

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/healthcheck`, { method: HttpMethod.Get, headers });
    });
  });
});
