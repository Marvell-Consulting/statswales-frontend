import { Request, Response, NextFunction } from 'express';

import { NotFoundException } from '../../shared/exceptions/not-found.exception';
import { hasError, datasetIdValidator } from '../../shared/validators';
import { DatasetInclude } from '../../shared/enums/dataset-include';

export const fetchDataset = (include?: DatasetInclude) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const datasetIdError = await hasError(datasetIdValidator(), req);

    if (datasetIdError) {
      next(new NotFoundException('errors.dataset_missing'));
      return;
    }

    try {
      const dataset = await req.pubapi.getDataset(req.params.datasetId, include);
      res.locals.datasetId = dataset.id;
      res.locals.dataset = dataset;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if ([401, 403].includes(err.status)) {
        next(err);
        return;
      }
      next(new NotFoundException('errors.dataset_missing'));
      return;
    }

    next();
  };
};
