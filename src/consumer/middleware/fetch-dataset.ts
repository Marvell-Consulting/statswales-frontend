import { Request, Response, NextFunction } from 'express';
import { NotFoundException } from '../../shared/exceptions/not-found.exception';
import { hasError, datasetIdValidator } from '../../shared/validators';

export const fetchPublishedDataset = async (req: Request, res: Response, next: NextFunction) => {
  const datasetIdError = await hasError(datasetIdValidator(), req);

  if (datasetIdError) {
    next(new NotFoundException('errors.dataset_missing'));
    return;
  }

  try {
    const dataset = await req.conapi.getPublishedDataset(req.params.datasetId);
    res.locals.datasetId = dataset.id;
    res.locals.dataset = dataset;
  } catch (_err) {
    next(new NotFoundException('errors.dataset_missing'));
    return;
  }

  next();
};
