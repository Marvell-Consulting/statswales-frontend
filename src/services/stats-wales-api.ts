import { ReadableStream } from 'node:stream/web';

import { FileListError, FileList } from '../dtos/file-list';
import { ViewDTO, ViewErrDTO } from '../dtos/view-dto';
import { Healthcheck } from '../dtos/healthcheck';
import { UploadDTO, UploadErrDTO } from '../dtos/upload-dto';
import { DatasetDTO, FileImportDTO } from '../dtos/dataset-dto';
import { DimensionCreationDTO } from '../dtos/dimension-creation-dto';
import { ConfirmedImportDTO } from '../dtos/confirmed-import-dto';

import { logger } from '../utils/logger';
import { appConfig } from '../config';

const config = appConfig();

class HttpError extends Error {
    public status: number;

    constructor(status: number) {
        super('');
        this.status = status;
    }

    async handleMessage(message: Promise<string>) {
        const msg = await message;
        this.message = msg;
    }
}

export class StatsWalesApi {
    private readonly backendUrl = config.backend.url;
    private readonly authHeader: Record<string, string>;

    constructor(
        private lang: string,
        private token?: string
    ) {
        this.lang = lang;
        this.authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    }

    public async getFileList() {
        logger.debug(`Fetching file list from ${this.backendUrl}/${this.lang}/dataset/active`);

        const filelist: FileList = await fetch(`${this.backendUrl}/${this.lang}/dataset/active`, {
            headers: this.authHeader
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                const err = new HttpError(response.status);
                err.handleMessage(response.text());
                throw err;
            })
            .then((api_res) => {
                return api_res as FileList;
            })
            .catch((error) => {
                logger.error(`An HTTP error occurred with status ${error.status} and message "${error.message}"`);
                return { status: error.status, files: [], error: error.message } as FileListError;
            });
        return filelist;
    }

    public async getFileFromImport(datasetId: string, revisionId: string, importId: string) {
        logger.debug(
            `Fetching file from ${this.backendUrl}/${this.lang}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/raw`
        );

        const fileResponse = await fetch(
            `${this.backendUrl}/${this.lang}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/raw`,
            {
                headers: this.authHeader
            }
        );
        if (!fileResponse.body) {
            throw new Error('No file response');
        }
        const body = fileResponse.body as ReadableStream;
        return body;
    }

    public async getDataset(datasetId: string): Promise<DatasetDTO> {
        logger.info(`Fetching dataset from ${this.backendUrl}/${this.lang}/dataset/${datasetId}`);
        const dataset = await fetch(`${this.backendUrl}/${this.lang}/dataset/${datasetId}`, {
            headers: this.authHeader
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                const err = new HttpError(response.status);
                err.handleMessage(response.text());
                throw err;
            })
            .then((api_res) => {
                return api_res as DatasetDTO;
            });

        return dataset;
    }

    public async getDatasetView(datasetId: string, pageNumber: number, pageSize: number) {
        logger.info(
            `Fetching dataset view from ${this.backendUrl}/${this.lang}/dataset/${datasetId}/view?page_number=${pageNumber}&page_size=${pageSize}`
        );
        const file = await fetch(
            `${this.backendUrl}/${this.lang}/dataset/${datasetId}/view?page_number=${pageNumber}&page_size=${pageSize}`,
            { headers: this.authHeader }
        )
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                const err = new HttpError(response.status);
                err.handleMessage(response.text());
                throw err;
            })
            .then((api_res) => {
                return api_res as ViewDTO;
            })
            .catch((error) => {
                logger.error(`An HTTP error occurred with status ${error.status} and message "${error.message}"`);
                return {
                    success: false,
                    status: error.status,
                    errors: [
                        {
                            field: 'file',
                            tag: {
                                name: 'errors.dataset_missing',
                                params: {}
                            }
                        }
                    ],
                    dataset_id: datasetId
                } as ViewErrDTO;
            });
        return file;
    }

    public async getDatasetDatafilePreview(
        datasetId: string,
        revisionId: string,
        importId: string,
        pageNumber: number,
        pageSize: number
    ) {
        const file = await fetch(
            `${this.backendUrl}/${this.lang}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/preview?page_number=${pageNumber}&page_size=${pageSize}`,
            { headers: this.authHeader }
        )
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                if (response.status === 401) {
                    logger.error('JWT timed out and the request was not authorised');
                }
                const err = new HttpError(response.status);
                err.handleMessage(response.text());
                throw err;
            })
            .then((api_res) => {
                return api_res as ViewDTO;
            })
            .catch((error) => {
                logger.error(`An HTTP error occurred with status ${error.status} and message "${error.message}"`);
                return {
                    success: false,
                    status: error.status,
                    errors: [
                        {
                            field: 'file',
                            tag: {
                                name: 'errors.dataset_missing',
                                params: {}
                            }
                        }
                    ],
                    dataset_id: datasetId
                } as ViewErrDTO;
            });
        return file;
    }

    public async uploadCSVtoCreateDataset(file: Blob, filename: string, title: string) {
        const formData = new FormData();
        formData.set('csv', file, filename);
        formData.set('title', title);

        const processedCSV = await fetch(`${this.backendUrl}/${this.lang}/dataset/`, {
            method: 'POST',
            body: formData,
            headers: this.authHeader
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                const err = new HttpError(response.status);
                err.handleMessage(response.text());
                throw err;
            })
            .then((api_res) => {
                const datasetDTO = api_res as DatasetDTO;
                return {
                    success: true,
                    dataset: datasetDTO
                } as UploadDTO;
            })
            .catch((error) => {
                logger.error(`An HTTP error occured with status ${error.status} and message "${error.message}"`);
                return {
                    success: false,
                    status: error.status,
                    errors: [
                        {
                            field: 'csv',
                            tag: {
                                name: 'errors.upload.no_csv_data',
                                params: {}
                            }
                        }
                    ],
                    dataset: undefined
                } as UploadErrDTO;
            });
        return processedCSV;
    }

    public async removeFileImport(datasetId: string, revisionId: string, importId: string) {
        const revisedDataset = await fetch(
            `${this.backendUrl}/${this.lang}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}`,
            {
                method: 'DELETE',
                headers: this.authHeader
            }
        )
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                const err = new HttpError(response.status);
                err.handleMessage(response.text());
                throw err;
            })
            .then((api_res) => {
                const updatedDatasetDto = api_res as DatasetDTO;
                return {
                    success: true,
                    dataset: updatedDatasetDto
                } as UploadDTO;
            });
        return revisedDataset;
    }

    public async confirmFileImport(datasetId: string, revisionId: string, importId: string) {
        const confirmedDataset = await fetch(
            `${this.backendUrl}/${this.lang}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/confirm`,
            {
                method: 'PATCH',
                headers: this.authHeader
            }
        )
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                const err = new HttpError(response.status);
                err.handleMessage(response.text());
                throw err;
            })
            .then((api_res) => {
                const updatedImportDto = api_res as FileImportDTO;
                return {
                    success: true,
                    fileImport: updatedImportDto
                } as ConfirmedImportDTO;
            });
        return confirmedDataset;
    }

    public async getSourcesForFileImport(datasetId: string, revisionId: string, importId: string) {
        const confirmedImport = await fetch(
            `${this.backendUrl}/${this.lang}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}`,
            {
                method: 'GET',
                headers: this.authHeader
            }
        )
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                const err = new HttpError(response.status);
                err.handleMessage(response.text());
                throw err;
            })
            .then((api_res) => {
                const updatedImportDto = api_res as FileImportDTO;
                return {
                    success: true,
                    fileImport: updatedImportDto
                } as ConfirmedImportDTO;
            });
        return confirmedImport;
    }

    public async sendCreateDimensionRequest(
        datasetId: string,
        revisionId: string,
        importId: string,
        dimensionCreationDtoArr: DimensionCreationDTO[]
    ) {
        const confirmedDatasetDto = await fetch(
            `${this.backendUrl}/${this.lang}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/sources`,
            {
                method: 'PATCH',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { ...this.authHeader, 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(dimensionCreationDtoArr)
            }
        )
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                const err = new HttpError(response.status);
                err.handleMessage(response.text());
                throw err;
            })
            .then((api_res) => {
                const datasetDTO = api_res as DatasetDTO;
                return {
                    success: true,
                    dataset: datasetDTO
                } as UploadDTO;
            });
        return confirmedDatasetDto;
    }

    public async uploadCSVToFixDataset(datasetId: string, revisionId: string, file: Blob, filename: string) {
        const formData = new FormData();
        formData.set('csv', file, filename);

        const processedCSV = await fetch(
            `${this.backendUrl}/${this.lang}/dataset/${datasetId}/revision/by-id/${revisionId}/import`,
            {
                method: 'POST',
                headers: this.authHeader,
                body: formData
            }
        )
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                const err = new HttpError(response.status);
                err.handleMessage(response.text());
                throw err;
            })
            .then((api_res) => {
                const datasetDTO = api_res as DatasetDTO;
                return {
                    success: true,
                    dataset: datasetDTO
                } as UploadDTO;
            })
            .catch((error) => {
                logger.error(`An HTTP error occurred with status ${error.status} and message "${error.message}"`);
                return {
                    success: false,
                    status: error.status,
                    errors: [
                        {
                            field: 'csv',
                            tag: {
                                name: 'errors.upload.no_csv_data',
                                params: {}
                            }
                        }
                    ],
                    dataset: undefined
                } as UploadErrDTO;
            });
        return processedCSV;
    }

    public async ping() {
        const health = await fetch(`${this.backendUrl}/healthcheck`)
            .then((api_res) => api_res.json())
            .then((api_res) => {
                return api_res as Healthcheck;
            });
        return health.status === 'App is running';
    }
}
