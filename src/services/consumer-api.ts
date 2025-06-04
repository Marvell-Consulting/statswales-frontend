import { ReadableStream } from 'node:stream/web';

import { logger as parentLogger } from '../utils/logger';
import { DatasetDTO } from '../dtos/dataset';
import { appConfig } from '../config';
import { HttpMethod } from '../enums/http-method';
import { ApiException } from '../exceptions/api.exception';
import { Locale } from '../enums/locale';
import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { ViewDTO } from '../dtos/view-dto';
import { FileFormat } from '../enums/file-format';
import { PublishedTopicsDTO } from '../dtos/published-topics-dto';
import { FilterInterface } from '../interfaces/filterInterface';

const config = appConfig();

const logger = parentLogger.child({ service: 'consumer-api' });

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

    return fetch(`${this.backendUrl}/${url}`, { method, headers: head, body: data })
      .then(async (response: Response) => {
        if (!response.ok) {
          const body = await new Response(response.body).text();
          if (body) {
            throw new ApiException(response.statusText, response.status, body);
          }
          throw new ApiException(response.statusText, response.status);
        }
        return response;
      })
      .catch((error) => {
        logger.error(`An api error occurred with status '${error.status}' and message '${error.message}'`);
        throw new ApiException(error.message, error.status, error.body);
      });
  }

  public async ping(): Promise<boolean> {
    return this.fetch({ url: 'healthcheck' }).then(() => true);
  }

  public async getPublishedTopics(topicId?: string, page = 1, limit = 20): Promise<PublishedTopicsDTO> {
    logger.debug(`Fetching published datasets for topic: ${topicId}`);
    const qs = `${new URLSearchParams({ page: page.toString(), limit: limit.toString() }).toString()}`;
    const url = topicId ? `published/topic/${topicId}?${qs}` : `published/topic`;

    return this.fetch({ url }).then((response) => response.json() as unknown as PublishedTopicsDTO);
  }

  public async getPublishedDatasetList(page = 1, limit = 20): Promise<ResultsetWithCount<DatasetListItemDTO>> {
    logger.debug(`Fetching published dataset list...`);
    const qs = `${new URLSearchParams({ page: page.toString(), limit: limit.toString() }).toString()}`;

    return this.fetch({ url: `published/list?${qs}` }).then(
      (response) => response.json() as unknown as ResultsetWithCount<DatasetListItemDTO>
    );
  }

  public async getPublishedDataset(datasetId: string): Promise<DatasetDTO> {
    logger.debug(`Fetching published dataset: ${datasetId}`);
    return this.fetch({ url: `published/${datasetId}` }).then((response) => response.json() as unknown as DatasetDTO);
  }

  public async getPublishedDatasetView(
    datasetId: string,
    pageSize: number,
    pageNumber: number,
    sortBy?: string,
    filter?: FilterInterface[]
  ): Promise<ViewDTO> {
    logger.debug(`Fetching published view of dataset: ${datasetId}`);
    const searchParams = new URLSearchParams({ page_number: pageNumber.toString(), page_size: pageSize.toString() });

    if (filter && filter.length) {
      searchParams.set('filter', JSON.stringify(filter));
    }

    if (sortBy) searchParams.append('sort_by', sortBy);

    return this.fetch({ url: `published/${datasetId}/view?${searchParams.toString()}` }).then(
      (response) => response.json() as unknown as ViewDTO
    );
  }

  public async getCubeFileStream(datasetId: string, format: FileFormat, language: Locale): Promise<ReadableStream> {
    logger.debug(`Fetching ${format} stream for dataset: ${datasetId}...`);

    return this.fetch({
      url: `published/${datasetId}/download/${format}`,
      lang: language
    }).then((response) => response.body as ReadableStream);
  }
}
