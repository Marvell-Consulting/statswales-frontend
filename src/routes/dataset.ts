import { Readable } from 'node:stream';

import { Router, Request, Response, NextFunction } from 'express';

import { ViewDTO } from '../dtos/view-dto';
import { fetchDataset } from '../middleware/fetch-dataset';
import { NotFoundException } from '../exceptions/not-found.exception';
import { logger } from '../utils/logger';
import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { hasError, factTableIdValidator } from '../validators';
import { RevisionDTO } from '../dtos/revision';
import { FactTableDto } from '../dtos/fact-table';

export const dataset = Router();

// Special thanks ChatGPT...  The GovUK pagination algorithm
function generateSequenceForNumber(highlight: number, end: number): (string | number)[] {
    const sequence: (string | number)[] = [];

    // Validate input
    if (highlight > end) {
        throw new Error(`Highlighted number must be between 1 and ${end}.`);
    }

    // Numbers before the highlighted number
    if (highlight - 1 > 1) {
        sequence.push(1, '...');
        sequence.push(highlight - 1);
    } else {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        sequence.push(...Array.from({ length: highlight - 1 }, (_, index) => index + 1));
    }

    // Highlighted number
    sequence.push(highlight);

    // Numbers after the highlighted number
    if (highlight + 1 < end) {
        sequence.push(highlight + 1);
        sequence.push('...', end);
    } else {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        sequence.push(...Array.from({ length: end - highlight }, (_, index) => highlight + 1 + index));
    }

    return sequence;
}

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
    if (!datasetView) {
        throw new NotFoundException();
    }

    // eslint-disable-next-line require-atomic-updates
    res.locals.pagination = generateSequenceForNumber(datasetView?.current_page, datasetView?.total_pages);
    res.render('view/data', datasetView);
});

dataset.get('/:datasetId/import/:importId', fetchDataset, async (req: Request, res: Response, next: NextFunction) => {
    const dataset = res.locals.dataset;
    const importIdError = await hasError(factTableIdValidator(), req);

    if (importIdError) {
        logger.error('Invalid or missing importId');
        next(new NotFoundException('errors.import_missing'));
        return;
    }

    try {
        const importId = req.params.importId;
        let factTable: FactTableDto | undefined;

        const revision = dataset.revisions?.find((rev: RevisionDTO) => {
            factTable = rev.fact_tables?.find((file: FactTableDto) => file.id === importId);
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
});
