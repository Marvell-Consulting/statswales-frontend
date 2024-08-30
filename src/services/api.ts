import { FileListError, FileList } from '../dtos/filelist';
import { ViewDTO, ViewErrDTO } from '../dtos/view-dto';
import { Healthcheck } from '../dtos/healthcehck';
import { UploadDTO, UploadErrDTO } from '../dtos/upload-dto';
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
    private readonly backendUrl: string | undefined;

    constructor() {
        this.backendUrl = process.env.BACKEND_URL;
    }

    public async getFileList(lang: string) {
        logger.debug(`Fetching file list from ${this.backendUrl}/${lang}/dataset`);
        const filelist: FileList = await fetch(`${this.backendUrl}/${lang}/dataset`)
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

    public async getFileData(lang: string, file_id: string, page_number: number, page_size: number) {
        const file = await fetch(
            `${this.backendUrl}/${lang}/dataset/${file_id}/view?page_number=${page_number}&page_size=${page_size}`
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
                    dataset_id: file_id
                } as ViewErrDTO;
            });
        return file;
    }

    public async uploadCSV(lang: string, file: Blob, filename: string) {
        const formData = new FormData();
        formData.append('csv', file, filename);
        formData.append('internal_name', filename);

        const processedCSV = await fetch(`${this.backendUrl}/${lang}/dataset/`, {
            method: 'POST',
            body: formData
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
                return api_res as UploadDTO;
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
        const health = await fetch(`${this.backendUrl}/healthcheck`)
            .then((api_res) => api_res.json())
            .then((api_res) => {
                return api_res as Healthcheck;
            })
            .catch((error) => {
                logger.error(`An HTTP error occured with status ${error.status} and message "${error.message}"`);
                return { status: 'App is not running' } as Healthcheck;
            });
        return health.status === 'App is running';
    }
}
