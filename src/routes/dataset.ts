import { Readable } from 'node:stream';

import { Router, Request, Response, NextFunction } from 'express';

import { ViewDTO } from '../dtos/view-dto';
import { fetchDataset } from '../middleware/fetch-dataset';
import { NotFoundException } from '../exceptions/not-found.exception';
import { logger } from '../utils/logger';
import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { hasError, importIdValidator } from '../validators';
import { RevisionDTO } from '../dtos/revision';
import { FileImportDTO } from '../dtos/file-import';

export const dataset = Router();

dataset.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const datasets: DatasetListItemDTO[] = await req.swapi.getActiveDatasetList();
        res.render('view/list', datasets);
    } catch (err) {
        next(err);
    }
});

dataset.get('/:datasetId', fetchDataset, async (req: Request, res: Response, next: NextFunction) => {
    const datasetId = res.locals.datasetId;
    const page: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const pageSize: number = Number.parseInt(req.query.page_size as string, 10) || 100;
    let datasetView: ViewDTO | undefined;

    try {
        datasetView = await req.swapi.getDatasetView(datasetId, page, pageSize);
    } catch (err) {
        logger.error(err);
        next(new NotFoundException());
    }

    res.render('view/data', datasetView);
});

dataset.get('/:datasetId/import/:importId', fetchDataset, async (req: Request, res: Response, next: NextFunction) => {
    const dataset = res.locals.dataset;
    const importIdError = await hasError(importIdValidator(), req);

    if (importIdError) {
        logger.error('Invalid or missing importId');
        next(new NotFoundException('errors.import_missing'));
        return;
    }

    try {
        const importId = req.params.importId;
        let fileImport: FileImportDTO | undefined;

        const revision = dataset.revisions?.find((rev: RevisionDTO) => {
            fileImport = rev.imports?.find((file: FileImportDTO) => file.id === importId);
            return Boolean(fileImport);
        });

        if (!fileImport) {
            throw new Error('errors.import_missing');
        }

        const fileStream = await req.swapi.getOriginalUpload(dataset.id, revision.id, fileImport.id);
        res.status(200);
        res.header('Content-Type', fileImport.mime_type);
        res.header(`Content-Disposition: attachment; filename="${fileImport.filename}"`);
        const readable: Readable = Readable.from(fileStream);
        readable.pipe(res);
    } catch (err) {
        next(new NotFoundException('errors.import_missing'));
    }
});
