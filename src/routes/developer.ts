import { Readable } from 'node:stream';

import { Router, Request, Response, NextFunction } from 'express';

import { ViewDTO } from '../dtos/view-dto';
import { fetchDataset } from '../middleware/fetch-dataset';
import { NotFoundException } from '../exceptions/not-found.exception';
import { logger } from '../utils/logger';
import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { hasError, factTableIdValidator } from '../validators';
import { RevisionDTO } from '../dtos/revision';
import { FactTableDTO } from '../dtos/fact-table';
import { generateSequenceForNumber } from '../utils/pagination';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';

export const developer = Router();

developer.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const results: ResultsetWithCount<DatasetListItemDTO> = await req.swapi.getActiveDatasetList();
        res.render('developer/list', { datasets: results.data });
    } catch (err) {
        next(err);
    }
});

developer.get('/:datasetId', fetchDataset, async (req: Request, res: Response, next: NextFunction) => {
    const datasetId = res.locals.datasetId;
    const page: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const pageSize: number = Number.parseInt(req.query.page_size as string, 10) || 100;
    let datasetView: ViewDTO | undefined;

    try {
        datasetView = await req.swapi.getDatasetView(datasetId, page, pageSize);
    } catch (err) {
        logger.error(err);
        next(new NotFoundException());
        return;
    }
    if (!datasetView) {
        next(new NotFoundException());
        return;
    }

    // eslint-disable-next-line require-atomic-updates
    res.locals.pagination = generateSequenceForNumber(datasetView?.current_page, datasetView?.total_pages);
    res.render('developer/data', datasetView);
});

developer.get(
    '/:datasetId/import/:factTableId',
    fetchDataset,
    async (req: Request, res: Response, next: NextFunction) => {
        const dataset = res.locals.dataset;
        const importIdError = await hasError(factTableIdValidator(), req);

        if (importIdError) {
            logger.error('Invalid or missing importId');
            next(new NotFoundException('errors.import_missing'));
            return;
        }

        try {
            const importId = req.params.factTableId;
            let factTable: FactTableDTO | undefined;

            const revision = dataset.revisions?.find((rev: RevisionDTO) => {
                factTable = rev.fact_tables?.find((file: FactTableDTO) => file.id === importId);
                return Boolean(factTable);
            });

            if (!factTable) {
                throw new Error('errors.import_missing');
            }

            const fileStream = await req.swapi.getOriginalUpload(dataset.id, revision.id, factTable.id);
            res.status(200);
            res.header('Content-Type', factTable.mime_type);
            res.header(`Content-Disposition: attachment; filename="${factTable.filename}"`);
            const readable: Readable = Readable.from(fileStream);
            readable.pipe(res);
        } catch (err) {
            next(new NotFoundException('errors.import_missing'));
        }
    }
);
