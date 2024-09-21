import { FileListError, FileList } from '../dtos2/filelist';
import { ViewDTO, ViewErrDTO } from '../dtos2/view-dto';
import { Healthcheck } from '../dtos2/healthcehck';
import { UploadDTO, UploadErrDTO } from '../dtos2/upload-dto';
import { DatasetDTO, ImportDTO } from '../dtos2/dataset-dto';
import { DimensionCreationDTO } from '../dtos2/dimension-creation-dto';
import { ConfirmedImportDTO } from '../dtos2/confirmed-import-dto';
import { logger } from '../utils/logger';

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
    private readonly backendUrl = process.env.BACKEND_URL || '';
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
        const revisiedDataset = await fetch(
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
        return revisiedDataset;
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
                const updatedImportDto = api_res as ImportDTO;
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
                const updatedImportDto = api_res as ImportDTO;
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
