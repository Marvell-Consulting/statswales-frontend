import { ReadableStream } from 'node:stream/web';
import { performance } from 'node:perf_hooks';

import { logger as parentLogger } from '../../shared/utils/logger';
import { DatasetDTO } from '../../shared/dtos/dataset';
import { appConfig } from '../../shared/config';
import { HttpMethod } from '../../shared/enums/http-method';
import { ApiException } from '../../shared/exceptions/api.exception';
import { Locale } from '../../shared/enums/locale';
import { DatasetListItemDTO } from '../../shared/dtos/dataset-list-item';
import { ResultsetWithCount } from '../../shared/interfaces/resultset-with-count';
import { ViewDTO } from '../../shared/dtos/view-dto';
import { FileFormat } from '../../shared/enums/file-format';
import { PublishedTopicsDTO } from '../../shared/dtos/published-topics-dto';
import { FilterInterface } from '../../shared/interfaces/filterInterface';
import { FilterTable } from '../../shared/dtos/filter-table';
import { SortByInterface } from '../../shared/interfaces/sort-by';
import { UnknownException } from '../../shared/exceptions/unknown.exception';

const config = appConfig();

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
  url: string;
  method?: HttpMethod;
  body?: FormData | string;
  json?: unknown;
  headers?: Record<string, string>;
  lang?: Locale;
}

export class ConsumerApi {
  private readonly backendUrl = config.backend.url;

  constructor(private lang = Locale.English) {}

  public async fetch({ url, method = HttpMethod.Get, body, json, headers, lang }: fetchParams): Promise<Response> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const head = {
      'Accept-Language': lang || this.lang,
      ...(json ? { 'Content-Type': 'application/json; charset=UTF-8' } : {}),
      ...headers
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    // if json is passed, then body will be ignored
    const data = json ? JSON.stringify(json) : body;
    const start = performance.now();

    return fetch(`${this.backendUrl}/${url}`, { method, headers: head, body: data })
      .then((response: Response) => {
        logRequestTime(method, url, start);
        return response;
      })
      .then(async (response: Response) => {
        if (!response.ok) {
          logger.error(
            `API request to ${this.backendUrl}/${url} failed with status '${response.status}' and message '${response.statusText}'`
          );
          const body = (await new Response(response.body).text()) || undefined;
          throw new ApiException(response.statusText, response.status, body);
        }
        return response;
      })
      .catch((error) => {
        if (error instanceof ApiException) throw error;
        logger.error(error, `An unknown error occurred attempting to fetch ${this.backendUrl}/${url}`);
        throw new UnknownException(error.mesage);
      });
  }

  public async ping(): Promise<boolean> {
    return this.fetch({ url: 'healthcheck' }).then(() => true);
  }

  public async getPublishedTopics(topicId?: string, page = 1, limit = 20): Promise<PublishedTopicsDTO> {
    logger.debug(`Fetching published datasets for topic: ${topicId}`);
    const qs = `${new URLSearchParams({ page: page.toString(), limit: limit.toString() }).toString()}`;
    const url = topicId ? `v1/topic/${topicId}?${qs}` : `v1/topic`;

    return this.fetch({ url }).then((response) => response.json() as unknown as PublishedTopicsDTO);
  }

  public async getPublishedDatasetList(page = 1, limit = 20): Promise<ResultsetWithCount<DatasetListItemDTO>> {
    logger.debug(`Fetching published dataset list...`);
    const qs = `${new URLSearchParams({ page_number: page.toString(), page_size: limit.toString() }).toString()}`;

    return this.fetch({ url: `v1?${qs}` }).then(
      (response) => response.json() as unknown as ResultsetWithCount<DatasetListItemDTO>
    );
  }

  public async getPublishedDataset(datasetId: string): Promise<DatasetDTO> {
    logger.debug(`Fetching published dataset: ${datasetId}`);
    return this.fetch({ url: `v1/${datasetId}` }).then((response) => response.json() as unknown as DatasetDTO);
  }

  public async getPublishedDatasetView(
    datasetId: string,
    pageSize: number,
    pageNumber: number,
    sortBy?: SortByInterface,
    filter?: FilterInterface[]
  ): Promise<ViewDTO> {
    logger.debug(`Fetching published view of dataset: ${datasetId}`);
    const searchParams = new URLSearchParams({ page_number: pageNumber.toString(), page_size: pageSize.toString() });

    if (filter && filter.length) {
      searchParams.set('filter', JSON.stringify(filter));
    }

    if (sortBy) {
      searchParams.append('sort_by', JSON.stringify([sortBy]));
    }

    return this.fetch({ url: `v1/${datasetId}/view?${searchParams.toString()}` }).then(
      (response) => response.json() as unknown as ViewDTO
    );
  }

  public async getPublishedDatasetFilters(datasetId: string): Promise<FilterTable> {
    logger.debug(`Fetching published view of dataset: ${datasetId}`);
    return this.fetch({ url: `v1/${datasetId}/view/filters` }).then(
      (response) => response.json() as unknown as FilterTable
    );
  }

  public async getCubeFileStream(
    datasetId: string,
    format: FileFormat,
    language: Locale,
    selectedFilterOptions?: string,
    sortBy?: string
  ): Promise<ReadableStream> {
    logger.debug(`Fetching ${format} stream for dataset: ${datasetId}...`);

    const searchParams = new URLSearchParams();

    if (selectedFilterOptions) {
      searchParams.set('filter', selectedFilterOptions);
    }

    if (sortBy) searchParams.append('sort_by', sortBy);

    return this.fetch({
      url: `v1/${datasetId}/download/${format}?${searchParams.toString()}`,
      lang: language
    }).then((response) => response.body as ReadableStream);
  }
}
