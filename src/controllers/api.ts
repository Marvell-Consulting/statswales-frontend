import { env } from 'node:process';

import { FileListError, FileList } from '../dtos2/filelist';
import { ViewDTO, ViewErrDTO } from '../dtos2/view-dto';
import { Healthcheck } from '../dtos2/healthcehck';
import { UploadDTO, UploadErrDTO } from '../dtos2/upload-dto';
import { DatasetDTO } from '../dtos2/dataset-dto';
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

export class API {
    private readonly backend_server: string | undefined;
    private readonly backend_port: string | undefined;
    private readonly backend_protocol: string;

    constructor() {
        this.backend_server = env.BACKEND_SERVER;
        this.backend_port = env.BACKEND_PORT;
        if (env.BACKEND_PROTOCOL === 'https') {
            this.backend_protocol = 'https';
        } else {
            this.backend_protocol = 'http';
        }
    }

    public async getFileList(lang: string) {
        logger.debug(
            `Fetching file list from ${this.backend_protocol}://${this.backend_server}:${this.backend_port}/${lang}/dataset`
        );
        const filelist: FileList = await fetch(
            `${this.backend_protocol}://${this.backend_server}:${this.backend_port}/${lang}/dataset`
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
                return api_res as FileList;
            })
            .catch((error) => {
                logger.error(`An HTTP error occured with status ${error.status} and message "${error.message}"`);
                return { status: error.status, files: [], error: error.message } as FileListError;
            });
        return filelist;
    }

    public async getDatasetView(lang: string, datasetId: string, page_number: number, page_size: number) {
        logger.info(
            `Fetching dataset view from ${this.backend_protocol}://${this.backend_server}:${this.backend_port}/${lang}/dataset/${datasetId}/view?page_number=${page_number}&page_size=${page_size}`
        );
        const file = await fetch(
            `${this.backend_protocol}://${this.backend_server}:${this.backend_port}/${lang}/dataset/${datasetId}/view?page_number=${page_number}&page_size=${page_size}`
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
                logger.error(`An HTTP error occured with status ${error.status} and message "${error.message}"`);
                return {
                    success: false,
                    status: error.status,
                    errors: [
                        {
                            field: 'file',
                            message: [
                                {
                                    lang,
                                    message: 'errors.dataset_missing'
                                }
                            ],
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
        lang: string,
        datasetId: string,
        revisionId: string,
        importId: string,
        page_number: number,
        page_size: number
    ) {
        const file = await fetch(
            `${this.backend_protocol}://${this.backend_server}:${this.backend_port}/${lang}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/preview?page_number=${page_number}&page_size=${page_size}`
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
                logger.error(`An HTTP error occured with status ${error.status} and message "${error.message}"`);
                return {
                    success: false,
                    status: error.status,
                    errors: [
                        {
                            field: 'file',
                            message: [
                                {
                                    lang,
                                    message: 'errors.dataset_missing'
                                }
                            ],
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

    public async uploadCSV(lang: string, file: Blob, filename: string, title: string) {
        const formData = new FormData();
        formData.set('csv', file, filename);
        formData.set('title', title);

        const processedCSV = await fetch(
            `${this.backend_protocol}://${this.backend_server}:${this.backend_port}/${lang}/dataset/`,
            {
                method: 'POST',
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
                logger.error(`An HTTP error occured with status ${error.status} and message "${error.message}"`);
                return {
                    success: false,
                    status: error.status,
                    errors: [
                        {
                            field: 'csv',
                            message: [
                                {
                                    lang,
                                    message: 'errors.upload.no-csv-data'
                                }
                            ],
                            tag: {
                                name: 'errors.upload.no-csv-data',
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
        const health = await fetch(`${this.backend_protocol}://${this.backend_server}:${this.backend_port}/healthcheck`)
            .then((api_res) => api_res.json())
            .then((api_res) => {
                return api_res as Healthcheck;
            });
        return health.status === 'App is running';
    }
}
