import { NextFunction, Request, Response, Router } from 'express';

import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { statusToColour } from '../utils/status-to-colour';
import { getPaginationProps } from '../utils/pagination';

export const homepage = Router();

homepage.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'home';
  next();
});

homepage.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 20;
    const results: ResultsetWithCount<DatasetListItemDTO> = await req.pubapi.getDatasetList(page, limit);
    const { data, count } = results;
    const pagination = getPaginationProps(page, limit, count);
    let flash: string[] = [];
    if (req.session.flash) {
      flash = req.session.flash;
      req.session.flash = undefined;
      req.session.save();
    }
    res.render('homepage', { data, ...pagination, statusToColour, flash: flash.length > 0 ? flash : undefined });
  } catch (err) {
    next(err);
  }
});
