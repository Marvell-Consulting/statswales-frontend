import { ReadableStream } from 'node:stream/web';
import { performance } from 'node:perf_hooks';

import { logger as parentLogger } from '../../shared/utils/logger';
import { DatasetDTO } from '../../shared/dtos/dataset';
import { config } from '../../shared/config';
import { HttpMethod } from '../../shared/enums/http-method';
import { ApiException } from '../../shared/exceptions/api.exception';
import { Locale } from '../../shared/enums/locale';
import { DatasetListItemDTO } from '../../shared/dtos/dataset-list-item';
import { ResultsetWithCount } from '../../shared/interfaces/resultset-with-count';
import { ViewDTO, ViewV2DTO } from '../../shared/dtos/view-dto';
import { FileFormat } from '../../shared/enums/file-format';
import { PublishedTopicsDTO } from '../../shared/dtos/published-topics-dto';
import { Filter, FilterV2 } from '../../shared/interfaces/filter';
import { FilterTable } from '../../shared/dtos/filter-table';
import { SortByInterface } from '../../shared/interfaces/sort-by';
import { UnknownException } from '../../shared/exceptions/unknown.exception';
import { RevisionDTO } from '../../shared/dtos/revision';

const logger = parentLogger.child({ service: 'consumer-api' });

const logRequestTime = (method: string, url: string, start: number) => {
  const end = performance.now();
  const time = Math.round(end - start);
  const SLOW_RESPONSE_MS = 500;

  if (time > SLOW_RESPONSE_MS) {
    logger.warn(`SLOW: ${method} /${url} (${time}ms)`);
  } else {
    logger.debug(`${method} /${url} (${time}ms)`);
  }
};

interface fetchParams {
  method?: HttpMethod;
  url: string;
  query?: URLSearchParams | Record<string, string>;
  body?: FormData | string;
  json?: unknown;
  headers?: Record<string, string>;
  lang?: Locale;
}

export class ConsumerApi {
  private readonly backendUrl = config.backend.url;

  constructor(private lang = Locale.English) {}

  public async fetch(params: fetchParams): Promise<Response> {
    const { method = HttpMethod.Get, url, query, body, json, headers, lang = this.lang } = params;

    /* eslint-disable @typescript-eslint/naming-convention */
    const head = {
      'Accept-Language': lang,
      ...(json ? { 'Content-Type': 'application/json; charset=UTF-8' } : {}),
      ...headers
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    // if json is passed, then body will be ignored
    const data = json ? JSON.stringify(json) : body;
    const start = performance.now();
    const queryParams = new URLSearchParams(query);

    if (lang) {
      queryParams.set('lang', lang); // azure front door cache does not support passthrough of accept-language header
    }

    const qs = queryParams.size > 0 ? `?${queryParams.toString()}` : '';
    const fullUrl = `${this.backendUrl}/${url}${qs}`;

    return fetch(fullUrl, { method, headers: head, body: data })
      .then((response: Response) => {
        logRequestTime(method, fullUrl, start);
        return response;
      })
      .then(async (response: Response) => {
        if (!response.ok) {
          logger.error(
            `API request to ${fullUrl} failed with status '${response.status}' and message '${response.statusText}'`
          );
          const body = (await new Response(response.body).text()) || undefined;
          throw new ApiException(response.statusText, response.status, body);
        }
        return response;
      })
      .catch((error) => {
        if (error instanceof ApiException) throw error;
        logger.error(error, `An unknown error occurred attempting to fetch ${fullUrl}`);
        throw new UnknownException(error.mesage);
      });
  }

  public async ping(): Promise<boolean> {
    return this.fetch({ url: 'healthcheck' }).then(() => true);
  }

  public async getPublishedTopics(
    topicId?: string,
    pageNumber = 1,
    pageSize = 20,
    sortBy?: SortByInterface
  ): Promise<PublishedTopicsDTO> {
    logger.debug(`Fetching published datasets for topic: ${topicId}`);
    const url = topicId ? `v1/topic/${topicId}` : `v1/topic`;
    const query = new URLSearchParams({ page_number: pageNumber.toString(), page_size: pageSize.toString() });

    if (sortBy) {
      query.append('sort_by', JSON.stringify([sortBy]));
    }

    return this.fetch({ url, query }).then((response) => response.json() as unknown as PublishedTopicsDTO);
  }

  public async getPublishedDatasetList(page = 1, limit = 20): Promise<ResultsetWithCount<DatasetListItemDTO>> {
    logger.debug(`Fetching published dataset list...`);
    const query = { page_number: page.toString(), page_size: limit.toString() };

    return this.fetch({ url: `v1`, query }).then(
      (response) => response.json() as unknown as ResultsetWithCount<DatasetListItemDTO>
    );
  }

  public async getPublishedDataset(datasetId: string): Promise<DatasetDTO> {
    logger.debug(`Fetching published dataset: ${datasetId}`);
    return this.fetch({ url: `v1/${datasetId}` }).then((response) => response.json() as unknown as DatasetDTO);
  }

  public async getPublishedDatasetView(
    datasetId: string,
    pageNumber: number,
    pageSize: number,
    sortBy?: SortByInterface,
    filter?: Filter[]
  ): Promise<ViewDTO> {
    logger.debug(`Fetching published view of dataset: ${datasetId}`);
    const query = new URLSearchParams({ page_number: pageNumber.toString(), page_size: pageSize.toString() });

    if (filter && filter.length) {
      query.set('filter', JSON.stringify(filter));
    }

    if (sortBy) {
      query.append('sort_by', JSON.stringify([sortBy]));
    }

    return this.fetch({ url: `v1/${datasetId}/view`, query }).then((response) => response.json() as unknown as ViewDTO);
  }

  public async getPublishedDatasetFilters(datasetId: string): Promise<FilterTable[]> {
    logger.debug(`Fetching published view of dataset: ${datasetId}`);
    return this.fetch({ url: `v1/${datasetId}/view/filters` }).then(
      (response) => response.json() as unknown as FilterTable[]
    );
  }

  public async generateFilterId(datasetId: string, selectedFilters: FilterV2[]): Promise<string> {
    logger.debug(`Generating filter ID for dataset: ${datasetId}`);
    return this.fetch({
      method: HttpMethod.Post,
      url: `v2/${datasetId}/data`,
      json: { filters: selectedFilters }
    }).then((response) => response.json().then((data) => data.filterId as string));
  }

  public async getFilteredDatasetView(
    datasetId: string,
    filterId: string,
    pageNumber: number,
    pageSize: number,
    sortBy?: SortByInterface
  ): Promise<ViewV2DTO> {
    logger.debug(`Fetching filtered view of dataset: ${datasetId} with filter ID: ${filterId}`);
    const query = new URLSearchParams({ page_number: pageNumber.toString(), page_size: pageSize.toString() });

    if (sortBy) {
      query.append('sort_by', JSON.stringify([sortBy]));
    }

    query.append('format', 'frontend');

    return this.fetch({ url: `v2/${datasetId}/data/${filterId}`, query }).then(
      (response) => response.json() as unknown as ViewV2DTO
    );
  }

  public async getCubeFileStream(
    datasetId: string,
    format: FileFormat,
    lang: Locale,
    view?: string,
    selectedFilterOptions?: string,
    sortBy?: string
  ): Promise<ReadableStream> {
    logger.debug(`Fetching ${format} stream for dataset: ${datasetId}...`);
    const query = new URLSearchParams();

    if (view) {
      query.set('view', view);
    }

    if (selectedFilterOptions) {
      query.set('filter', selectedFilterOptions);
    }

    if (sortBy) {
      query.append('sort_by', sortBy);
    }

    return this.fetch({ url: `v1/${datasetId}/download/${format}`, query, lang }).then(
      (response) => response.body as ReadableStream
    );
  }

  public async getPublicationHistory(datasetId: string): Promise<RevisionDTO[]> {
    logger.debug(`Fetching publication history for dataset: ${datasetId}`);
    return this.fetch({ url: `v1/${datasetId}/history` }).then(
      (response) => response.json() as unknown as RevisionDTO[]
    );
  }
}
