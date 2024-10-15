import { Readable } from 'stream';

import { Router, Response, NextFunction } from 'express';
import { validate as validateUUID } from 'uuid';

import { StatsWalesApi } from '../services/stats-wales-api';
import { FileList } from '../dtos/file-list';
import { ViewErrDTO } from '../dtos/view-dto';
import { logger } from '../utils/logger';
import { AuthedRequest } from '../interfaces/authed-request';
import { FileImportDTO } from '../dtos/dataset-dto';
import { Locale } from '../enums/locale';

export const dataset = Router();

const statsWalesApi = (req: AuthedRequest) => {
    const lang = req.language as Locale;
    const token = req.jwt;
    return new StatsWalesApi(lang, token);
};

dataset.get('/', async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        const fileList: FileList = await statsWalesApi(req).getFileList();
        logger.debug(`FileList from server = ${JSON.stringify(fileList)}`);
        res.render('view/list', fileList);
    } catch (err: any) {
        next(err);
    }
});

dataset.get('/:datasetId', async (req: AuthedRequest, res: Response) => {
    const datasetId = req.params.datasetId;
    const page: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const page_size: number = Number.parseInt(req.query.page_size as string, 10) || 100;

    if (!validateUUID(datasetId)) {
        const err: ViewErrDTO = {
            success: false,
            status: 404,
            dataset_id: undefined,
            errors: [
                {
                    field: 'file',
                    tag: {
                        name: 'errors.dataset_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(404);
        res.render('view/data', { errors: err });
        return;
    }

    try {
        const file = await statsWalesApi(req).getDatasetView(datasetId, page, page_size);
        res.render('view/data', file);
    } catch (error: any) {
        res.status(error?.status);
        res.render('view/data', { errors: error?.errors });
    }
});

dataset.get('/:datasetId/import/:importId', async (req: AuthedRequest, res: Response) => {
    if (!validateUUID(req.params.datasetId)) {
        const err: ViewErrDTO = {
            success: false,
            status: 404,
            dataset_id: undefined,
            errors: [
                {
                    field: 'file',
                    tag: {
                        name: 'errors.dataset_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(404);
        res.render('view/data', { errors: err });
        return;
    }

    if (!validateUUID(req.params.importId)) {
        const err: ViewErrDTO = {
            success: false,
            status: 404,
            dataset_id: undefined,
            errors: [
                {
                    field: 'file',
                    tag: {
                        name: 'errors.import_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(404);
        res.render('view/data', { errors: err });
        return;
    }

    const datasetId = req.params.datasetId;
    const importId = req.params.importId;
    const datasetDTO = await statsWalesApi(req).getDataset(datasetId);
    const imports: FileImportDTO[] = [];
    for (const rev of datasetDTO.revisions) {
        rev.imports.forEach((imp: FileImportDTO) => imports.push(imp));
    }
    const fileImport = imports.find((imp) => imp.id === importId);
    if (!fileImport) {
        const err: ViewErrDTO = {
            success: false,
            status: 404,
            dataset_id: undefined,
            errors: [
                {
                    field: 'file',
                    tag: {
                        name: 'errors.import_not_found',
                        params: {}
                    }
                }
            ]
        };
        res.status(404);
        res.render('view/data', { errors: err });
        return;
    }
    const fileStream = await statsWalesApi(req).getFileFromImport(datasetId, fileImport.revision_id, fileImport.id);
    res.status(200);
    res.header('Content-Type', fileImport.mime_type);
    res.header(`Content-Disposition: attachment; filename="${fileImport.filename}"`);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
});
