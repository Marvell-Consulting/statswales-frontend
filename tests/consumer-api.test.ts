import { randomUUID } from 'node:crypto';

import { config } from '../src/shared/config';
import { HttpMethod } from '../src/shared/enums/http-method';
import { ApiException } from '../src/shared/exceptions/api.exception';
import { UnknownException } from '../src/shared/exceptions/unknown.exception';
import { Locale } from '../src/shared/enums/locale';
import { FileFormat } from '../src/shared/enums/file-format';
import { SearchMode } from '../src/shared/enums/search-mode';
import { ConsumerApi } from '../src/consumer/services/consumer-api';

describe('ConsumerApi', () => {
  let consumerApi: ConsumerApi;
  let fetchSpy: jest.SpyInstance;
  let mockResponse: Promise<Response>;

  const baseUrl = config.backend.url;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const headers = { 'Accept-Language': 'en' };

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => mockResponse);
    consumerApi = new ConsumerApi();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Locale handling', () => {
    it('should default to English', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));
      await consumerApi.ping();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/healthcheck?lang=en`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        expect.objectContaining({ headers: expect.objectContaining({ 'Accept-Language': 'en' }) })
      );
    });

    it('should use Welsh when constructed with the Welsh locale', async () => {
      consumerApi = new ConsumerApi(Locale.Welsh);
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));

      await consumerApi.ping();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/healthcheck?lang=cy`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        expect.objectContaining({ headers: expect.objectContaining({ 'Accept-Language': 'cy' }) })
      );
    });

    it('should allow per-request language override', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));

      await consumerApi.fetch({ url: 'healthcheck', lang: Locale.Welsh });

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/healthcheck?lang=cy`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        expect.objectContaining({ headers: expect.objectContaining({ 'Accept-Language': 'cy' }) })
      );
    });
  });

  describe('Rate limit bypass', () => {
    const bypassToken = 'test-bypass-token';
    const originalToken = config.backend.rateLimitBypassToken;

    beforeEach(() => {
      delete (config.backend as Record<string, unknown>).rateLimitBypassToken;
    });

    afterAll(() => {
      config.backend.rateLimitBypassToken = originalToken;
    });

    it('should include x-rate-limit-bypass header when bypass token is configured', async () => {
      config.backend.rateLimitBypassToken = bypassToken;
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));

      await consumerApi.ping();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/healthcheck?lang=en`,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { ...headers, 'x-rate-limit-bypass': bypassToken }
        })
      );
    });

    it('should not include x-rate-limit-bypass header when bypass token is not configured', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));

      await consumerApi.ping();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/healthcheck?lang=en`,
        expect.objectContaining({
          headers: expect.not.objectContaining({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-rate-limit-bypass': expect.anything()
          })
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw an UnknownException when the backend is unreachable', async () => {
      mockResponse = Promise.reject(new Error('Service Unavailable'));
      await expect(consumerApi.fetch({ url: 'example.com/api' })).rejects.toThrow(
        new UnknownException('Service Unavailable')
      );
    });

    it('should throw an ApiException when the backend returns a 400', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 400, statusText: 'Bad Request' }));
      await expect(consumerApi.fetch({ url: 'example.com/api' })).rejects.toMatchObject({
        name: 'ApiException',
        message: 'Bad Request',
        status: 400
      });
    });

    it('should throw an ApiException when the backend returns a 404', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
      await expect(consumerApi.fetch({ url: 'example.com/api' })).rejects.toMatchObject({
        name: 'ApiException',
        message: 'Not Found',
        status: 404
      });
    });

    it('should throw an ApiException when the backend returns a 500', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
      await expect(consumerApi.fetch({ url: 'example.com/api' })).rejects.toMatchObject({
        name: 'ApiException',
        message: 'Internal Server Error',
        status: 500
      });
    });

    it('should include the response body in the ApiException when present', async () => {
      mockResponse = Promise.resolve(new Response('detailed error body', { status: 400, statusText: 'Bad Request' }));

      await expect(consumerApi.fetch({ url: 'example.com/api' })).rejects.toMatchObject({
        name: 'ApiException',
        message: 'Bad Request',
        status: 400,
        body: 'detailed error body'
      });
    });

    it('should still throw an ApiException with the original status when the error body cannot be read', async () => {
      const erroringStream = new ReadableStream({
        start(controller) {
          controller.error(new Error('stream read failure'));
        }
      });
      mockResponse = Promise.resolve(new Response(erroringStream, { status: 503, statusText: 'Service Unavailable' }));

      await expect(consumerApi.fetch({ url: 'example.com/api' })).rejects.toMatchObject({
        name: 'ApiException',
        message: 'Service Unavailable',
        status: 503
      });
    });
  });

  describe('Request body and JSON', () => {
    it('should serialize a json payload and set the Content-Type header', async () => {
      mockResponse = Promise.resolve(new Response(JSON.stringify({ ok: true })));
      const json = { foo: 'bar' };

      await consumerApi.fetch({ method: HttpMethod.Post, url: 'example.com/api', json });

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/example.com/api?lang=en`,
        expect.objectContaining({
          method: HttpMethod.Post,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: expect.objectContaining({ ...headers, 'Content-Type': 'application/json; charset=UTF-8' }),
          body: JSON.stringify(json)
        })
      );
    });

    it('should prefer json over body when both are provided', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));
      const json = { foo: 'bar' };

      await consumerApi.fetch({ method: HttpMethod.Post, url: 'example.com/api', json, body: 'ignored' });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ body: JSON.stringify(json) })
      );
    });
  });

  describe('ping', () => {
    it('should return true when the backend is reachable', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));

      const ping = await consumerApi.ping();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/healthcheck?lang=en`,
        expect.objectContaining({ method: HttpMethod.Get, headers: expect.objectContaining(headers) })
      );
      expect(ping).toBe(true);
    });

    it('should throw when the backend is unreachable', async () => {
      mockResponse = Promise.reject(new Error('Service Unavailable'));
      await expect(consumerApi.ping()).rejects.toThrow(new UnknownException('Service Unavailable'));
    });
  });

  describe('getPublishedTopics', () => {
    it('should fetch the top-level topic list with default pagination', async () => {
      const topics = { topics: [], datasets: [], parents: [], selectedTopic: null };
      mockResponse = Promise.resolve(new Response(JSON.stringify(topics)));

      const result = await consumerApi.getPublishedTopics();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v1/topic?page_number=1&page_size=20&lang=en`,
        expect.objectContaining({ method: HttpMethod.Get, headers: expect.objectContaining(headers) })
      );
      expect(result).toEqual(topics);
    });

    it('should fetch a specific topic by id and forward pagination params', async () => {
      const topicId = '42';
      const topics = { topics: [], datasets: [], parents: [], selectedTopic: { id: 42 } };
      mockResponse = Promise.resolve(new Response(JSON.stringify(topics)));

      const result = await consumerApi.getPublishedTopics(topicId, 3, 50);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v1/topic/${topicId}?page_number=3&page_size=50&lang=en`,
        expect.objectContaining({ method: HttpMethod.Get })
      );
      expect(result).toEqual(topics);
    });

    it('should serialize sortBy when provided', async () => {
      mockResponse = Promise.resolve(new Response(JSON.stringify({ topics: [], datasets: [], parents: [] })));

      await consumerApi.getPublishedTopics(undefined, 1, 20, { columnName: 'title', direction: 'DESC' });

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v1/topic?page_number=1&page_size=20&sort_by=title%3Adesc&lang=en`,
        expect.any(Object)
      );
    });

    it('should throw when the backend returns an error', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
      await expect(consumerApi.getPublishedTopics()).rejects.toThrow(ApiException);
    });
  });

  describe('getPublishedDatasetList', () => {
    it('should request the dataset list with default pagination', async () => {
      const datasets = { data: [{ id: randomUUID(), title: 'Example' }], count: 1 };
      mockResponse = Promise.resolve(new Response(JSON.stringify(datasets)));

      const result = await consumerApi.getPublishedDatasetList();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v1?page_number=1&page_size=20&lang=en`,
        expect.objectContaining({ method: HttpMethod.Get })
      );
      expect(result).toEqual(datasets);
    });

    it('should forward explicit pagination params', async () => {
      mockResponse = Promise.resolve(new Response(JSON.stringify({ data: [], count: 0 })));

      await consumerApi.getPublishedDatasetList(5, 25);

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/v1?page_number=5&page_size=25&lang=en`, expect.any(Object));
    });

    it('should throw when the backend returns 404', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
      await expect(consumerApi.getPublishedDatasetList()).rejects.toThrow(ApiException);
    });
  });

  describe('getPublishedDataset', () => {
    it('should fetch a single dataset via the v2 endpoint', async () => {
      const datasetId = randomUUID();
      const dataset = { id: datasetId, title: 'Example Dataset' };
      mockResponse = Promise.resolve(new Response(JSON.stringify(dataset)));

      const result = await consumerApi.getPublishedDataset(datasetId);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}?lang=en`,
        expect.objectContaining({ method: HttpMethod.Get, headers: expect.objectContaining(headers) })
      );
      expect(result).toEqual(dataset);
    });

    it('should throw when the dataset is not found', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
      await expect(consumerApi.getPublishedDataset(randomUUID())).rejects.toMatchObject({
        name: 'ApiException',
        message: 'Not Found',
        status: 404
      });
    });
  });

  describe('getPublishedDatasetView', () => {
    it('should request a paginated view with the frontend format flag', async () => {
      const datasetId = randomUUID();
      const view = { dataset_id: datasetId, page_number: 2, page_size: 50 };
      mockResponse = Promise.resolve(new Response(JSON.stringify(view)));

      const result = await consumerApi.getPublishedDatasetView(datasetId, 2, 50);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/data?page_number=2&page_size=50&format=frontend&lang=en`,
        expect.objectContaining({ method: HttpMethod.Get })
      );
      expect(result).toEqual(view);
    });

    it('should append sort_by when supplied', async () => {
      const datasetId = randomUUID();
      mockResponse = Promise.resolve(new Response(JSON.stringify({})));

      await consumerApi.getPublishedDatasetView(datasetId, 1, 10, { columnName: 'Year', direction: 'ASC' });

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/data?page_number=1&page_size=10&format=frontend&sort_by=Year%3Aasc&lang=en`,
        expect.any(Object)
      );
    });

    it('should throw when the backend returns an error', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
      await expect(consumerApi.getPublishedDatasetView(randomUUID(), 1, 10)).rejects.toThrow(ApiException);
    });

    it('sends cursor and omits page_number when a cursor is supplied (SW-1246)', async () => {
      const datasetId = randomUUID();
      mockResponse = Promise.resolve(new Response(JSON.stringify({})));

      await consumerApi.getPublishedDatasetView(datasetId, 1, 25, undefined, 'opaque-cursor-token');

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/data?cursor=opaque-cursor-token&page_size=25&format=frontend&lang=en`,
        expect.any(Object)
      );
    });
  });

  describe('getPublishedDatasetFilters', () => {
    it('should fetch the filter table list', async () => {
      const datasetId = randomUUID();
      const filters = [{ columnName: 'Area', values: ['Wales', 'England'] }];
      mockResponse = Promise.resolve(new Response(JSON.stringify(filters)));

      const result = await consumerApi.getPublishedDatasetFilters(datasetId);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/filters?lang=en`,
        expect.objectContaining({ method: HttpMethod.Get })
      );
      expect(result).toEqual(filters);
    });

    it('should throw on 404', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
      await expect(consumerApi.getPublishedDatasetFilters(randomUUID())).rejects.toThrow(ApiException);
    });
  });

  describe('generatePivotFilterId', () => {
    it('should POST data options and return the filterId', async () => {
      const datasetId = randomUUID();
      const filterId = randomUUID();
      mockResponse = Promise.resolve(new Response(JSON.stringify({ filterId })));

      const dataOptions = { filters: [], options: { use_raw_column_names: true } };
      const result = await consumerApi.generatePivotFilterId(datasetId, dataOptions);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/pivot?lang=en`,
        expect.objectContaining({
          method: HttpMethod.Post,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: expect.objectContaining({ ...headers, 'Content-Type': 'application/json; charset=UTF-8' }),
          body: JSON.stringify(dataOptions)
        })
      );
      expect(result).toBe(filterId);
    });

    it('should throw on backend errors', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 400, statusText: 'Bad Request' }));
      await expect(consumerApi.generatePivotFilterId(randomUUID(), {})).rejects.toThrow(ApiException);
    });
  });

  describe('generateFilterId', () => {
    it('should POST data options to the data endpoint and return the filterId', async () => {
      const datasetId = randomUUID();
      const filterId = randomUUID();
      mockResponse = Promise.resolve(new Response(JSON.stringify({ filterId })));

      const dataOptions = { filters: [] };
      const result = await consumerApi.generateFilterId(datasetId, dataOptions);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/data?lang=en`,
        expect.objectContaining({
          method: HttpMethod.Post,
          body: JSON.stringify(dataOptions)
        })
      );
      expect(result).toBe(filterId);
    });
  });

  describe('getFilteredDatasetView', () => {
    it('should fetch a filtered view by filterId', async () => {
      const datasetId = randomUUID();
      const filterId = randomUUID();
      const view = { dataset_id: datasetId, page_number: 1, page_size: 10 };
      mockResponse = Promise.resolve(new Response(JSON.stringify(view)));

      const result = await consumerApi.getFilteredDatasetView(datasetId, filterId, 1, 10);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/data/${filterId}?page_number=1&page_size=10&format=frontend&lang=en`,
        expect.objectContaining({ method: HttpMethod.Get })
      );
      expect(result).toEqual(view);
    });

    it('should append sort_by when provided', async () => {
      const datasetId = randomUUID();
      const filterId = randomUUID();
      mockResponse = Promise.resolve(new Response(JSON.stringify({})));

      await consumerApi.getFilteredDatasetView(datasetId, filterId, 1, 10, {
        columnName: 'Year',
        direction: 'DESC'
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/data/${filterId}?page_number=1&page_size=10&format=frontend&sort_by=Year%3Adesc&lang=en`,
        expect.any(Object)
      );
    });
  });

  describe('getPivotedDatasetView', () => {
    it('should fetch a pivoted view by filterId', async () => {
      const datasetId = randomUUID();
      const filterId = randomUUID();
      const view = { dataset_id: datasetId, page_number: 1, page_size: 10 };
      mockResponse = Promise.resolve(new Response(JSON.stringify(view)));

      const result = await consumerApi.getPivotedDatasetView(datasetId, filterId, 1, 10);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/pivot/${filterId}?page_number=1&page_size=10&format=frontend&lang=en`,
        expect.objectContaining({ method: HttpMethod.Get })
      );
      expect(result).toEqual(view);
    });

    it('should append sort_by when provided', async () => {
      const datasetId = randomUUID();
      const filterId = randomUUID();
      mockResponse = Promise.resolve(new Response(JSON.stringify({})));

      await consumerApi.getPivotedDatasetView(datasetId, filterId, 1, 10, {
        columnName: 'Region',
        direction: 'ASC'
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/pivot/${filterId}?page_number=1&page_size=10&format=frontend&sort_by=Region%3Aasc&lang=en`,
        expect.any(Object)
      );
    });

    it('should throw on backend errors', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
      await expect(consumerApi.getPivotedDatasetView(randomUUID(), randomUUID(), 1, 10)).rejects.toThrow(ApiException);
    });
  });

  describe('downloadPublishedData', () => {
    it('should stream the response body for the requested format and language', async () => {
      const datasetId = randomUUID();
      const filterId = randomUUID();
      const stream = new ReadableStream();
      mockResponse = Promise.resolve(new Response(stream));

      const result = await consumerApi.downloadPublishedData(datasetId, filterId, FileFormat.Csv, Locale.Welsh);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/data/${filterId}?format=csv&lang=cy`,
        expect.objectContaining({
          method: HttpMethod.Get,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: expect.objectContaining({ 'Accept-Language': 'cy' })
        })
      );
      expect(result).toBe(stream);
    });

    it('should support every supported file format', async () => {
      const datasetId = randomUUID();
      const filterId = randomUUID();

      for (const format of [FileFormat.Csv, FileFormat.Parquet, FileFormat.Xlsx, FileFormat.Json]) {
        mockResponse = Promise.resolve(new Response(new ReadableStream()));
        await consumerApi.downloadPublishedData(datasetId, filterId, format, Locale.English);

        expect(fetchSpy).toHaveBeenCalledWith(
          `${baseUrl}/v2/${datasetId}/data/${filterId}?format=${format}&lang=en`,
          expect.any(Object)
        );
      }
    });
  });

  describe('downloadPublishedPivotData', () => {
    it('should stream the pivot response body for the requested format and language', async () => {
      const datasetId = randomUUID();
      const filterId = randomUUID();
      const stream = new ReadableStream();
      mockResponse = Promise.resolve(new Response(stream));

      const result = await consumerApi.downloadPublishedPivotData(
        datasetId,
        filterId,
        FileFormat.Parquet,
        Locale.English
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/${datasetId}/pivot/${filterId}?format=parquet&lang=en`,
        expect.objectContaining({ method: HttpMethod.Get, headers: expect.objectContaining(headers) })
      );
      expect(result).toBe(stream);
    });
  });

  describe('getPublicationHistory', () => {
    it('should fetch the revision history for a dataset', async () => {
      const datasetId = randomUUID();
      const history = [
        { id: randomUUID(), revision_index: 1 },
        { id: randomUUID(), revision_index: 2 }
      ];
      mockResponse = Promise.resolve(new Response(JSON.stringify(history)));

      const result = await consumerApi.getPublicationHistory(datasetId);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v1/${datasetId}/history?lang=en`,
        expect.objectContaining({ method: HttpMethod.Get })
      );
      expect(result).toEqual(history);
    });

    it('should throw when the dataset is not found', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
      await expect(consumerApi.getPublicationHistory(randomUUID())).rejects.toThrow(ApiException);
    });
  });

  describe('search', () => {
    it('should send the search mode, keywords and pagination params', async () => {
      const results = { data: [{ id: randomUUID(), title: 'Match' }], count: 1 };
      mockResponse = Promise.resolve(new Response(JSON.stringify(results)));

      const result = await consumerApi.search(SearchMode.FTS, 'population', 2, 25);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/search?mode=fts&keywords=population&page_number=2&page_size=25&lang=en`,
        expect.objectContaining({ method: HttpMethod.Get })
      );
      expect(result).toEqual(results);
    });

    it('should default to the first page of 100 results', async () => {
      mockResponse = Promise.resolve(new Response(JSON.stringify({ data: [], count: 0 })));

      await consumerApi.search(SearchMode.Basic, 'wales');

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/search?mode=basic&keywords=wales&page_number=1&page_size=100&lang=en`,
        expect.any(Object)
      );
    });

    it('should URL-encode keywords containing spaces and special characters', async () => {
      mockResponse = Promise.resolve(new Response(JSON.stringify({ data: [], count: 0 })));

      await consumerApi.search(SearchMode.Fuzzy, 'gross & net');

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/v2/search?mode=fuzzy&keywords=gross+%26+net&page_number=1&page_size=100&lang=en`,
        expect.any(Object)
      );
    });

    it('should throw when the backend returns an error', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
      await expect(consumerApi.search(SearchMode.Basic, 'x')).rejects.toThrow(ApiException);
    });
  });
});
