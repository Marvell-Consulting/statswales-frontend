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

    if (dataset.replaced_by?.auto_redirect) {
      res.redirect(301, req.buildUrl(`/${dataset.replaced_by.dataset_id}`, req.language));
      return;
    }
  } catch (_err) {
    next(new NotFoundException('errors.dataset_missing'));
    return;
  }

  next();
};
