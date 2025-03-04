import { Request, Response, NextFunction } from 'express';

import { NotFoundException } from '../exceptions/not-found.exception';
import { getLatestRevision, getDataTable } from '../utils/revision';
import { logger } from '../utils/logger';
import { hasError, datasetIdValidator } from '../validators';

export const fetchFullDataset = async (req: Request, res: Response, next: NextFunction) => {
    const datasetIdError = await hasError(datasetIdValidator(), req);

    if (datasetIdError) {
        logger.error('Invalid or missing datasetId');
        next(new NotFoundException('errors.dataset_missing'));
        return;
    }

    try {
        const dataset = await req.pubapi.getFullDataset(req.params.datasetId);
        res.locals.datasetId = dataset.id;
        res.locals.dataset = dataset;
        res.locals.revision = getLatestRevision(dataset);
        res.locals.dataTable = getDataTable(res.locals.revision);
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

export const fetchLimitedDataset = async (req: Request, res: Response, next: NextFunction) => {
    const datasetIdError = await hasError(datasetIdValidator(), req);

    if (datasetIdError) {
        logger.error('Invalid or missing datasetId');
        next(new NotFoundException('errors.dataset_missing'));
        return;
    }

    try {
        const dataset = await req.pubapi.getLimitedDataset(req.params.datasetId);
        res.locals.datasetId = dataset.id;
        res.locals.dataset = dataset;
        res.locals.revision = getLatestRevision(dataset);
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

export const fetchPublishedDataset = async (req: Request, res: Response, next: NextFunction) => {
    const datasetIdError = await hasError(datasetIdValidator(), req);

    if (datasetIdError) {
        logger.error('Invalid or missing datasetId');
        next(new NotFoundException('errors.dataset_missing'));
        return;
    }

    try {
        const dataset = await req.conapi.getPublishedDataset(req.params.datasetId);
        res.locals.datasetId = dataset.id;
        res.locals.dataset = dataset;
    } catch (err: any) {
        next(new NotFoundException('errors.dataset_missing'));
        return;
    }

    next();
};
