import { ReadableStream } from 'node:stream/web';

import { RequestHandler } from 'express';

import { FileList } from '../dtos/file-list';
import { ViewDTO } from '../dtos/view-dto';
import { DatasetDTO, DatasetInfoDTO, FileImportDTO } from '../dtos/dataset-dto';
import { DimensionCreationDTO } from '../dtos/dimension-creation-dto';
import { logger as parentLogger } from '../utils/logger';
import { appConfig } from '../config';
import { HttpMethod } from '../enums/http-method';
import { ApiException } from '../exceptions/api.exception';
import { ViewException } from '../exceptions/view.exception';
import { Locale } from '../enums/locale';

const config = appConfig();

const logger = parentLogger.child({ service: 'sw-api' });

export class StatsWalesApi {
    private readonly backendUrl = config.backend.url;

    constructor(
        private lang = Locale.English,
        private token?: string
    ) {
        this.lang = lang;
        this.token = token;
    }

    public async fetch(
        path: string,
        method: HttpMethod = HttpMethod.Get,
        body?: any,
        extraHeaders?: Record<string, string>
    ): Promise<Response> {
        const headers = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Accept-Language': this.lang,
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
            ...extraHeaders
        };

        return fetch(`${this.backendUrl}/${path}`, { method, headers, body })
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

    public async getFileList(): Promise<FileList> {
        logger.debug(`Fetching file list...`);
        return this.fetch(`dataset/active`).then((response) => response.json() as unknown as FileList);
    }

    public async getFileFromImport(datasetId: string, revisionId: string, importId: string): Promise<ReadableStream> {
        logger.debug(`Fetching raw file import: ${importId}...`);

        return this.fetch(`dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/raw`).then(
            (response) => response.body as ReadableStream
        );
    }

    public async confirmFileImport(datasetId: string, revisionId: string, importId: string): Promise<FileImportDTO> {
        logger.debug(`Confirming file import: ${importId}`);

        return this.fetch(
            `dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/confirm`,
            HttpMethod.Patch
        ).then((response) => response.json() as unknown as FileImportDTO);
    }

    public async getSourcesForFileImport(
        datasetId: string,
        revisionId: string,
        importId: string
    ): Promise<FileImportDTO> {
        logger.debug(`Fetching sources for file import: ${importId}`);

        return this.fetch(`dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}`).then(
            (response) => response.json() as unknown as FileImportDTO
        );
    }

    public async removeFileImport(datasetId: string, revisionId: string, importId: string): Promise<DatasetDTO> {
        logger.debug(`Removing file import: ${importId}`);

        return this.fetch(
            `dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}`,
            HttpMethod.Delete
        ).then((response) => response.json() as unknown as DatasetDTO);
    }

    public async getDataset(datasetId: string): Promise<DatasetDTO> {
        logger.debug(`Fetching dataset: ${datasetId}`);
        return this.fetch(`dataset/${datasetId}`).then((response) => response.json() as unknown as DatasetDTO);
    }

    public async getDatasetView(datasetId: string, pageNumber: number, pageSize: number): Promise<ViewDTO> {
        logger.debug(`Fetching view for dataset: ${datasetId}, page: ${pageNumber}, pageSize: ${pageSize}`);

        return this.fetch(`dataset/${datasetId}/view?page_number=${pageNumber}&page_size=${pageSize}`)
            .then((response) => response.json() as unknown as ViewDTO)
            .catch((error) => {
                throw new ViewException(error.message, error.status, [
                    {
                        field: 'file',
                        tag: {
                            name: 'errors.dataset_missing',
                            params: {}
                        }
                    }
                ]);
            });
    }

    public async getDatasetDatafilePreview(
        datasetId: string,
        revisionId: string,
        importId: string,
        pageNumber: number,
        pageSize: number
    ): Promise<ViewDTO> {
        logger.debug(
            `Fetching datafile preview for dataset: ${datasetId}, revision: ${revisionId}, import: ${importId}, page: ${pageNumber}, pageSize: ${pageSize}`
        );

        return this.fetch(
            `dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/preview?page_number=${pageNumber}&page_size=${pageSize}`
        )
            .then((response) => response.json() as unknown as ViewDTO)
            .catch((error) => {
                throw new ViewException(error.message, error.status, [
                    {
                        field: 'file',
                        tag: {
                            name: 'errors.dataset_missing',
                            params: {}
                        }
                    }
                ]);
            });
    }

    public async uploadCSVtoCreateDataset(file: Blob, filename: string, title: string): Promise<DatasetDTO> {
        logger.debug(`Uploading CSV to create dataset with title '${title}'`);

        const formData = new FormData();
        formData.set('csv', file, filename);
        formData.set('title', title);

        return this.fetch('dataset', HttpMethod.Post, formData)
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

    public async sendCreateDimensionRequest(
        datasetId: string,
        revisionId: string,
        importId: string,
        dimensionCreationDtoArr: DimensionCreationDTO[]
    ): Promise<DatasetDTO> {
        logger.debug(`Creating dimensions for import: ${importId}`);

        return this.fetch(
            `dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/sources`,
            HttpMethod.Patch,
            JSON.stringify(dimensionCreationDtoArr),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { 'Content-Type': 'application/json; charset=UTF-8' }
        ).then((response) => response.json() as unknown as DatasetDTO);
    }

    public async sendDatasetInfo(datasetId: string, datasetInfo: DatasetInfoDTO): Promise<DatasetDTO> {
        return this.fetch(
            `dataset/${datasetId}/info`,
            HttpMethod.Patch,
            JSON.stringify(datasetInfo),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { 'Content-Type': 'application/json; charset=UTF-8' }
        ).then((response) => response.json() as unknown as DatasetDTO);
    }

    public async uploadCSVToFixDataset(
        datasetId: string,
        revisionId: string,
        file: Blob,
        filename: string
    ): Promise<DatasetDTO> {
        logger.debug(`Uploading CSV to fix dataset: ${datasetId}`);

        const formData = new FormData();
        formData.set('csv', file, filename);

        return this.fetch(`dataset/${datasetId}/revision/by-id/${revisionId}/import`, HttpMethod.Post, formData)
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

    public async ping(): Promise<boolean> {
        logger.debug(`Pinging healthcheck...`);

        return this.fetch('healthcheck').then(() => {
            logger.debug('API responded to ping');
            return true;
        });
    }
}
