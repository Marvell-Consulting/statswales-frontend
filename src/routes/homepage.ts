import { NextFunction, Request, Response, Router } from 'express';

import { flashErrors, flashMessages } from '../middleware/flash';
import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { getPaginationProps } from '../utils/pagination';

export const homepage = Router();

homepage.use(flashMessages, flashErrors);

homepage.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'home';
  next();
});

homepage.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const errors = res.locals.errors;

  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 20;

    // user must be in at least one group to start a new dataset
    const canCreate = req.user?.groups?.length || 0 > 0;

    const results: ResultsetWithCount<DatasetListItemDTO> = await req.pubapi.getDatasetList(page, limit);
    const { data, count } = results;
    const pagination = getPaginationProps(page, limit, count);
    const flash = res.locals.flash;
    res.render('homepage', { data, ...pagination, flash, canCreate, errors });
  } catch (err) {
    next(err);
  }
});
