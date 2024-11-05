import { Request, Response, NextFunction } from 'express';

import { NotFoundException } from '../exceptions/not-found.exception';
import { getLatestRevision, getLatestImport } from '../utils/latest';
import { logger } from '../utils/logger';
import { hasError, datasetIdValidator } from '../validators';

export const fetchDataset = async (req: Request, res: Response, next: NextFunction) => {
    const datasetIdError = await hasError(datasetIdValidator(), req);
    if (datasetIdError) {
        logger.error('Invalid or missing datasetId');
        next(new NotFoundException('errors.dataset_missing'));
        return;
    }

    try {
        const dataset = await req.swapi.getDataset(req.params.datasetId);
        res.locals.datasetId = dataset.id;
        res.locals.dataset = dataset;
        res.locals.revision = getLatestRevision(dataset);
        res.locals.fileImport = getLatestImport(res.locals.revision);
    } catch (err: any) {
        if (err.status === 401) {
            next(err);
            return;
        }
        next(new NotFoundException('errors.dataset_missing'));
        return;
    }

    next();
};
