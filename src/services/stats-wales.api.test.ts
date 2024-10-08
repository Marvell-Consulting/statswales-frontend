import { randomUUID } from 'crypto';

import { appConfig } from '../config';
import { HttpMethod } from '../enums/http-method';
import { Locale } from '../enums/locale';
import { SourceType } from '../enums/source-type';
import { ApiException } from '../exceptions/api.exception';
import { ViewException } from '../exceptions/view.exception';
import { FileDescription } from '../dtos/file-list';
import { DimensionCreationDTO } from '../dtos/dimension-creation-dto';

import { StatsWalesApi } from './stats-wales-api';

describe('StatsWalesApi', () => {
    let statsWalesApi: StatsWalesApi;
    let fetchSpy: jest.SpyInstance;
    let mockResponse: Promise<Response>;

    const config = appConfig();
    const baseUrl = config.backend.url;
    const token = 'thisissomemadeupjwt';

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const headers = { 'Accept-Language': 'en' };

    beforeEach(() => {
        fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => mockResponse);
        statsWalesApi = new StatsWalesApi();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Authorization', () => {
        it('should include an Authorization header when a token is provided', async () => {
            statsWalesApi = new StatsWalesApi(Locale.English, token);
            mockResponse = Promise.resolve(new Response(null, { status: 200 }));

            await statsWalesApi.ping();

            expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/healthcheck`, {
                method: HttpMethod.Get,
                headers: { ...headers, Authorization: `Bearer ${token}` }
            });
        });
    });

    describe('Error handling', () => {
        it('should throw an ApiException when the backend is unreachable', async () => {
            mockResponse = Promise.reject(new Error('Service Unavailable'));
            await expect(statsWalesApi.fetch('example.com/api')).rejects.toThrow(
                new ApiException('Service Unavailable', undefined)
            );
        });

        it('should throw an ApiException when the backend returns a 500', async () => {
            mockResponse = Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
            await expect(statsWalesApi.fetch('example.com/api')).rejects.toThrow(
                new ApiException('Internal Server Error', 500)
            );
        });

        it('should throw an ApiException when the backend returns a 400', async () => {
            mockResponse = Promise.resolve(new Response(null, { status: 400, statusText: 'Bad Request' }));
            await expect(statsWalesApi.fetch('example.com/api')).rejects.toThrow(new ApiException('Bad Request', 400));
        });

        it('should throw an ApiException when the backend returns a 404', async () => {
            mockResponse = Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
            await expect(statsWalesApi.fetch('example.com/api')).rejects.toThrow(new ApiException('Not Found', 400));
        });
    });

    describe('getFileList', () => {
        it('should return an array of FileDescriptions', async () => {
            const files: FileDescription[] = [
                {
                    dataset_id: randomUUID(),
                    titles: [
                        { language: 'en', title: 'Example 1' },
                        { language: 'cy', title: 'Enghraifft 1' }
                    ]
                },
                { dataset_id: randomUUID(), titles: [{ language: 'en', title: 'Example 2' }] }
            ];

            mockResponse = Promise.resolve(new Response(JSON.stringify({ files })));

            const fileList = await statsWalesApi.getFileList();
            expect(fileList).toEqual({ files });
        });
    });

    describe('getFileFromImport', () => {
        it('should return a ReadableStream', async () => {
            const datasetId = randomUUID();
            const revisionId = randomUUID();
            const importId = randomUUID();
            const stream = new ReadableStream();

            mockResponse = Promise.resolve(new Response(stream));

            const fileStream = await statsWalesApi.getFileFromImport(datasetId, revisionId, importId);

            expect(fetchSpy).toHaveBeenCalledWith(
                `${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/raw`,
                { method: HttpMethod.Get, headers }
            );
            expect(fileStream).toBe(stream);
        });
    });

    describe('confirmFileImport', () => {
        it('should return a FileImportDTO', async () => {
            const datasetId = randomUUID();
            const revisionId = randomUUID();
            const importId = randomUUID();
            const fileImport = { dataset_id: datasetId, revision_id: revisionId, import_id: importId };

            mockResponse = Promise.resolve(new Response(JSON.stringify(fileImport)));

            const fileImportDTO = await statsWalesApi.confirmFileImport(datasetId, revisionId, importId);

            expect(fetchSpy).toHaveBeenCalledWith(
                `${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/confirm`,
                { method: HttpMethod.Patch, headers }
            );
            expect(fileImportDTO).toEqual(fileImport);
        });
    });

    describe('getSourcesForFileImport', () => {
        it('should return a FileImportDTO', async () => {
            const datasetId = randomUUID();
            const revisionId = randomUUID();
            const importId = randomUUID();
            const fileImport = { dataset_id: datasetId, revision_id: revisionId, import_id: importId };

            mockResponse = Promise.resolve(new Response(JSON.stringify(fileImport)));

            const fileImportDTO = await statsWalesApi.getSourcesForFileImport(datasetId, revisionId, importId);

            expect(fetchSpy).toHaveBeenCalledWith(
                `${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}`,
                { method: HttpMethod.Get, headers }
            );
            expect(fileImportDTO).toEqual(fileImport);
        });
    });

    describe('removeFileImport', () => {
        it('should return the updated DatasetDTO', async () => {
            const datasetId = randomUUID();
            const revisionId = randomUUID();
            const importId = randomUUID();
            const dataset = { id: datasetId, title: 'Example Dataset' };

            mockResponse = Promise.resolve(new Response(JSON.stringify(dataset)));

            const datasetDTO = await statsWalesApi.removeFileImport(datasetId, revisionId, importId);

            expect(fetchSpy).toHaveBeenCalledWith(
                `${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}`,
                { method: HttpMethod.Delete, headers }
            );
            expect(datasetDTO).toEqual(dataset);
        });
    });

    describe('getDataset', () => {
        it('should return a DatasetDTO', async () => {
            const datasetId = randomUUID();
            const dataset = { id: datasetId, title: 'Example Dataset' };

            mockResponse = Promise.resolve(new Response(JSON.stringify(dataset)));

            const datasetDTO = await statsWalesApi.getDataset(datasetId);

            expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/dataset/${datasetId}`, {
                method: HttpMethod.Get,
                headers
            });
            expect(datasetDTO).toEqual(dataset);
        });
    });

    describe('getDatasetView', () => {
        it('should return a ViewDTO', async () => {
            const datasetId = randomUUID();
            const view = { dataset_id: datasetId, page_number: 1, page_size: 10 };

            mockResponse = Promise.resolve(new Response(JSON.stringify(view)));

            const viewDTO = await statsWalesApi.getDatasetView(datasetId, 1, 10);

            expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/dataset/${datasetId}/view?page_number=1&page_size=10`, {
                method: HttpMethod.Get,
                headers
            });
            expect(viewDTO).toEqual(view);
        });

        it('should throw a ViewException when the backend returns an error', async () => {
            const datasetId = randomUUID();
            mockResponse = Promise.resolve(new Response(null, { status: 400, statusText: 'Bad Request' }));

            await expect(statsWalesApi.getDatasetView(datasetId, 1, 10)).rejects.toThrow(
                new ViewException('Bad Request', 400, [
                    {
                        field: 'file',
                        tag: {
                            name: 'errors.dataset_missing',
                            params: {}
                        }
                    }
                ])
            );
        });
    });

    describe('getDatasetDatafilePreview', () => {
        it('should return a ViewDTO', async () => {
            const datasetId = randomUUID();
            const revisionId = randomUUID();
            const importId = randomUUID();

            const view = {
                dataset_id: datasetId,
                revision_id: revisionId,
                import_id: importId,
                page_number: 1,
                page_size: 10
            };

            mockResponse = Promise.resolve(new Response(JSON.stringify(view)));

            const viewDTO = await statsWalesApi.getDatasetDatafilePreview(datasetId, revisionId, importId, 1, 10);

            expect(fetchSpy).toHaveBeenCalledWith(
                `${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/preview?page_number=1&page_size=10`,
                {
                    method: HttpMethod.Get,
                    headers
                }
            );
            expect(viewDTO).toEqual(view);
        });

        it('should throw a ViewException when the backend returns an error', async () => {
            const datasetId = randomUUID();
            const revisionId = randomUUID();
            const importId = randomUUID();

            mockResponse = Promise.resolve(new Response(null, { status: 400, statusText: 'Bad Request' }));

            await expect(
                statsWalesApi.getDatasetDatafilePreview(datasetId, revisionId, importId, 1, 10)
            ).rejects.toThrow(
                new ViewException('Bad Request', 400, [
                    {
                        field: 'file',
                        tag: {
                            name: 'errors.dataset_missing',
                            params: {}
                        }
                    }
                ])
            );
        });
    });

    describe('uploadCSVtoCreateDataset', () => {
        it('should return a DatasetDTO', async () => {
            const file = new Blob([JSON.stringify({ foo: 'bar' })]);
            const filename = 'example.csv';
            const title = 'Example Dataset';
            const dataset = { id: randomUUID(), title };

            const body = new FormData();
            body.set('csv', file, filename);
            body.set('title', title);

            mockResponse = Promise.resolve(new Response(JSON.stringify(dataset)));

            const datasetDTO = await statsWalesApi.uploadCSVtoCreateDataset(file, filename, title);

            expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/dataset`, {
                method: HttpMethod.Post,
                headers,
                body
            });
            expect(datasetDTO).toEqual(dataset);
        });

        it('should throw a ViewException when the backend returns an error', async () => {
            const file = new Blob([JSON.stringify({ foo: 'bar' })]);
            const filename = 'example.csv';
            const title = 'Example Dataset';

            const body = new FormData();
            body.set('csv', file, filename);
            body.set('title', title);

            mockResponse = Promise.resolve(new Response(null, { status: 400, statusText: 'Bad Request' }));

            await expect(statsWalesApi.uploadCSVtoCreateDataset(file, filename, title)).rejects.toThrow(
                new ViewException('Bad Request', 400, [
                    {
                        field: 'csv',
                        tag: {
                            name: 'errors.upload.no_csv_data',
                            params: {}
                        }
                    }
                ])
            );
        });
    });

    describe('sendCreateDimensionRequest', () => {
        it('should return a DatasetDTO', async () => {
            const datasetId = randomUUID();
            const revisionId = randomUUID();
            const importId = randomUUID();

            const dimensions: DimensionCreationDTO[] = [
                { sourceId: randomUUID(), sourceType: SourceType.Dimension },
                { sourceId: randomUUID(), sourceType: SourceType.DataValues }
            ];

            const dataset = { id: datasetId, title: 'Example Dataset' };

            mockResponse = Promise.resolve(new Response(JSON.stringify(dataset)));

            const datasetDTO = await statsWalesApi.sendCreateDimensionRequest(
                datasetId,
                revisionId,
                importId,
                dimensions
            );

            expect(fetchSpy).toHaveBeenCalledWith(
                `${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/import/by-id/${importId}/sources`,
                {
                    method: HttpMethod.Patch,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { ...headers, 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify(dimensions)
                }
            );
            expect(datasetDTO).toEqual(dataset);
        });
    });

    describe('uploadCSVToFixDataset', () => {
        it('should return a DatasetDTO', async () => {
            const datasetId = randomUUID();
            const revisionId = randomUUID();
            const file = new Blob([JSON.stringify({ foo: 'bar' })]);
            const filename = 'example.csv';
            const dataset = { id: datasetId, title: 'Example Dataset' };

            const body = new FormData();
            body.set('csv', file, filename);

            mockResponse = Promise.resolve(new Response(JSON.stringify(dataset)));

            const datasetDTO = await statsWalesApi.uploadCSVToFixDataset(datasetId, revisionId, file, filename);

            expect(fetchSpy).toHaveBeenCalledWith(
                `${baseUrl}/dataset/${datasetId}/revision/by-id/${revisionId}/import`,
                {
                    method: HttpMethod.Post,
                    headers,
                    body
                }
            );
            expect(datasetDTO).toEqual(dataset);
        });

        it('should throw a ViewException when the backend returns an error', async () => {
            const datasetId = randomUUID();
            const revisionId = randomUUID();
            const file = new Blob([JSON.stringify({ foo: 'bar' })]);
            const filename = 'example.csv';

            const body = new FormData();
            body.set('csv', file, filename);

            mockResponse = Promise.resolve(new Response(null, { status: 400, statusText: 'Bad Request' }));

            await expect(statsWalesApi.uploadCSVToFixDataset(datasetId, revisionId, file, filename)).rejects.toThrow(
                new ViewException('Bad Request', 400, [
                    {
                        field: 'csv',
                        tag: {
                            name: 'errors.upload.no_csv_data',
                            params: {}
                        }
                    }
                ])
            );
        });
    });

    describe('ping', () => {
        it('should return true when the backend is reachable', async () => {
            mockResponse = Promise.resolve(new Response(null, { status: 200 }));

            const ping = await statsWalesApi.ping();

            expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/healthcheck`, { method: HttpMethod.Get, headers });
            expect(ping).toBe(true);
        });

        it('should return false when the backend is unreachable', async () => {
            mockResponse = Promise.reject(new Error('Service Unavailable'));

            const ping = await statsWalesApi.ping();

            expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/healthcheck`, { method: HttpMethod.Get, headers });
            expect(ping).toBe(false);
        });
    });
});
