import { Logger } from 'pino';

import { FileList } from '../models/filelist';
import { ProcessedCSV } from '../models/processedcsv';
import { Healthcheck } from '../models/healthcehck';

export class API {
    private readonly backend_url: string;
    private readonly logger: Logger;

    constructor(backend_url: string, logger: Logger) {
        this.backend_url = backend_url;
        this.logger = logger;
    }

    public async getFileList(lang: string) {
        const filelist: FileList = await fetch(`${this.backend_url}/${lang}/api/csv`)
            .then((api_res) => api_res.json())
            .then((api_res) => {
                return api_res as FileList;
            });
        return filelist;
    }

    public async getFileData(lang: string, file_id: string, page_number: number, page_size: number) {
        const file = await fetch(
            `${this.backend_url}/${lang}/api/csv/${file_id}/view?page_number=${page_number}&page_size=${page_size}`
        )
            .then((api_res) => api_res.json())
            .then((api_res) => {
                return api_res as ProcessedCSV;
            });
        return file;
    }

    public async uploadCSV(lang: string, file: Blob, filename: string, description: string) {
        const formData = new FormData();
        formData.append('csv', file, filename);
        formData.append('filename', filename);
        formData.append('description', description);

        const processedCSV: ProcessedCSV = await fetch(`${this.backend_url}/${lang}/api/csv`, {
            method: 'POST',
            body: formData
        })
            .then((api_res) => {
                this.logger.debug(api_res);
                return api_res;
            })
            .then((api_res) => api_res.json())
            .then((api_res) => {
                return api_res as ProcessedCSV;
            });
        return processedCSV;
    }

    public async ping() {
        const health = await fetch(`${this.backend_url}/healthcheck`)
            .then((api_res) => api_res.json())
            .then((api_res) => {
                return api_res as Healthcheck;
            });
        return health.status === 'App is running';
    }
}
