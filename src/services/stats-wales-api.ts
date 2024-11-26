import { ReadableStream } from 'node:stream/web';

import { ViewDTO } from '../dtos/view-dto';
import { DatasetDTO } from '../dtos/dataset';
import { DatasetInfoDTO } from '../dtos/dataset-info';
import { FileImportDTO } from '../dtos/file-import';
import { SourceAssignmentDTO } from '../dtos/source-assignment-dto';
import { logger as parentLogger } from '../utils/logger';
import { appConfig } from '../config';
import { HttpMethod } from '../enums/http-method';
import { ApiException } from '../exceptions/api.exception';
import { ViewException } from '../exceptions/view.exception';
import { Locale } from '../enums/locale';
import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { TaskListState } from '../dtos/task-list-state';
import { DatasetProviderDTO } from '../dtos/dataset-provider';
import { ProviderDTO } from '../dtos/provider';
import { ProviderSourceDTO } from '../dtos/provider-source';
import { TopicDTO } from '../dtos/topic';

const config = appConfig();

const logger = parentLogger.child({ service: 'sw-api' });

interface fetchParams {
    url: string;
    method?: HttpMethod;
    body?: FormData | string;
    json?: unknown;
    headers?: Record<string, string>;
}

export class StatsWalesApi {
    private readonly backendUrl = config.backend.url;

    constructor(
        private lang = Locale.English,
        private token?: string
    ) {
        this.lang = lang;
        this.token = token;
    }

    public async fetch({ url, method = HttpMethod.Get, body, json, headers }: fetchParams): Promise<Response> {
        const head = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Accept-Language': this.lang,
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ...(json ? { 'Content-Type': 'application/json; charset=UTF-8' } : {}),
            ...headers
        };

        // if json is passed, then body will be ignored
        const data = json ? JSON.stringify(json) : body;

        return fetch(`${this.backendUrl}/${url}`, { method, headers: head, body: data })
            .then((response: Response) => {
                if (!response.ok) {
                    throw new ApiException(response.statusText, response.status);
                }
                return response;
            })
            .catch((error) => {
                logger.error(`An api error occurred with status '${error.status}' and message '${error.message}'`);
                throw new ApiException(error.message, error.status);
            });
    }

    public async ping(): Promise<boolean> {
        logger.debug(`Pinging backend...`);

        return this.fetch({ url: 'healthcheck' }).then(() => {
            logger.debug('API responded to ping');
            return true;
        });
    }

    public async createDataset(title?: string, language?: string): Promise<DatasetDTO> {
        logger.debug(`Creating dataset...`);
        const json: DatasetInfoDTO = { title, language };

        return this.fetch({ url: 'dataset', method: HttpMethod.Post, json }).then(
            (response) => response.json() as unknown as DatasetDTO
        );
    }

    public async getDataset(datasetId: string): Promise<DatasetDTO> {
        logger.debug(`Fetching dataset: ${datasetId}`);
        return this.fetch({ url: `dataset/${datasetId}` }).then((response) => response.json() as unknown as DatasetDTO);
    }

    public uploadCSVToDataset(datasetId: string, file: Blob, filename: string): Promise<DatasetDTO> {
        logger.debug(`Uploading file ${filename} to dataset: ${datasetId}`);
        const body = new FormData();
        body.set('csv', file, filename);

        return this.fetch({ url: `dataset/${datasetId}/data`, method: HttpMethod.Post, body }).then(
            (response) => response.json() as unknown as DatasetDTO
        );
    }

    public async getDatasetView(datasetId: string, pageNumber: number, pageSize: number): Promise<ViewDTO> {
        logger.debug(`Fetching view for dataset: ${datasetId}, page: ${pageNumber}, pageSize: ${pageSize}`);

        return this.fetch({ url: `dataset/${datasetId}/view?page_number=${pageNumber}&page_size=${pageSize}` }).then(
            (response) => response.json() as unknown as ViewDTO
        );
    }

    public async getActiveDatasetList(): Promise<DatasetListItemDTO[]> {
        logger.debug(`Fetching active dataset list...`);
        return this.fetch({ url: `dataset/active` }).then(
            (response) => response.json() as unknown as DatasetListItemDTO[]
        );
    }

    public async getOriginalUpload(datasetId: string, revisionId: string, importId: string): Promise<ReadableStream> {
        logger.debug(`Fetching raw file import: ${importId}...`);

        return this.fetch({
            url: `dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/raw`
        }).then((response) => response.body as ReadableStream);
    }

    public async confirmFileImport(datasetId: string, revisionId: string, importId: string): Promise<FileImportDTO> {
        logger.debug(`Confirming file import: ${importId}`);

        return this.fetch({
            url: `dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/confirm`,
            method: HttpMethod.Patch
        }).then((response) => response.json() as unknown as FileImportDTO);
    }

    public async getSourcesForFileImport(
        datasetId: string,
        revisionId: string,
        importId: string
    ): Promise<FileImportDTO> {
        logger.debug(`Fetching sources for file import: ${importId}`);

        return this.fetch({
            url: `dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}`
        }).then((response) => response.json() as unknown as FileImportDTO);
    }

    public async removeFileImport(datasetId: string, revisionId: string, importId: string): Promise<DatasetDTO> {
        logger.debug(`Removing file import: ${importId}`);

        return this.fetch({
            url: `dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}`,
            method: HttpMethod.Delete
        }).then((response) => response.json() as unknown as DatasetDTO);
    }

    public async getImportPreview(
        datasetId: string,
        revisionId: string,
        importId: string,
        pageNumber: number,
        pageSize: number
    ): Promise<ViewDTO> {
        logger.debug(
            `Fetching preview for dataset: ${datasetId}, revision: ${revisionId}, import: ${importId}, page: ${pageNumber}, pageSize: ${pageSize}`
        );

        return this.fetch({
            url: `dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/preview?page_number=${pageNumber}&page_size=${pageSize}`
        }).then((response) => response.json() as unknown as ViewDTO);
    }

    public async assignSources(
        datasetId: string,
        revisionId: string,
        importId: string,
        sourceTypeAssignment: SourceAssignmentDTO[]
    ): Promise<DatasetDTO> {
        logger.debug(`Assigning source types for import: ${importId}`);

        return this.fetch({
            url: `dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/sources`,
            method: HttpMethod.Patch,
            json: sourceTypeAssignment
        }).then((response) => response.json() as unknown as DatasetDTO);
    }

    public async updateDatasetInfo(datasetId: string, datasetInfo: DatasetInfoDTO): Promise<DatasetDTO> {
        return this.fetch({ url: `dataset/${datasetId}/info`, method: HttpMethod.Patch, json: datasetInfo }).then(
            (response) => response.json() as unknown as DatasetDTO
        );
    }

    public async addDatasetProvider(datasetId: string, provider: DatasetProviderDTO): Promise<DatasetDTO> {
        return this.fetch({ url: `dataset/${datasetId}/providers`, method: HttpMethod.Post, json: provider }).then(
            (response) => response.json() as unknown as DatasetDTO
        );
    }

    public async updateDatasetProviders(datasetId: string, providers: DatasetProviderDTO[]): Promise<DatasetDTO> {
        return this.fetch({ url: `dataset/${datasetId}/providers`, method: HttpMethod.Patch, json: providers }).then(
            (response) => response.json() as unknown as DatasetDTO
        );
    }

    public async getTaskList(datasetId: string): Promise<TaskListState> {
        logger.debug(`Fetching tasklist for dataset: ${datasetId}`);
        return this.fetch({ url: `dataset/${datasetId}/tasklist` }).then(
            (response) => response.json() as unknown as TaskListState
        );
    }

    public async uploadCSVtoCreateDataset(file: Blob, filename: string, title: string): Promise<DatasetDTO> {
        logger.debug(`Uploading CSV to create dataset with title '${title}'`);

        const body = new FormData();
        body.set('csv', file, filename);
        body.set('title', title);

        return this.fetch({ url: 'dataset', method: HttpMethod.Post, body })
            .then((response) => response.json() as unknown as DatasetDTO)
            .catch((error) => {
                throw new ViewException(error.message, error.status, [
                    {
                        field: 'csv',
                        tag: {
                            name: 'errors.upload.no_csv_data',
                            params: {}
                        }
                    }
                ]);
            });
    }

    public async uploadCSVToFixDataset(
        datasetId: string,
        revisionId: string,
        file: Blob,
        filename: string
    ): Promise<DatasetDTO> {
        logger.debug(`Uploading CSV to fix dataset: ${datasetId}`);

        const body = new FormData();
        body.set('csv', file, filename);

        return this.fetch({
            url: `dataset/${datasetId}/revision/by-id/${revisionId}/import`,
            method: HttpMethod.Post,
            body
        })
            .then((response) => response.json() as unknown as DatasetDTO)
            .catch((error) => {
                throw new ViewException(error.message, error.status, [
                    {
                        field: 'csv',
                        tag: {
                            name: 'errors.upload.no_csv_data',
                            params: {}
                        }
                    }
                ]);
            });
    }

    public async getAllProviders(): Promise<ProviderDTO[]> {
        logger.debug('Fetching data providers...');
        return this.fetch({ url: 'provider' }).then((response) => response.json() as unknown as ProviderDTO[]);
    }

    public async getSourcesByProvider(providerId: string): Promise<ProviderSourceDTO[]> {
        logger.debug('Fetching data provider sources...');
        return this.fetch({ url: `provider/${providerId}/sources` }).then(
            (response) => response.json() as unknown as ProviderSourceDTO[]
        );
    }

    public async getAllTopics(): Promise<TopicDTO[]> {
        logger.debug('Fetching topics...');
        return this.fetch({ url: 'topic' }).then((response) => response.json() as unknown as TopicDTO[]);
    }

    public async updateDatasetTopics(datasetId: string, topics: string[]): Promise<DatasetDTO> {
        return this.fetch({ url: `dataset/${datasetId}/topics`, method: HttpMethod.Patch, json: { topics } }).then(
            (response) => response.json() as unknown as DatasetDTO
        );
    }
}
