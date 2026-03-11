import { Request } from 'express';
import qs from 'qs';

import { parseSortBy } from '../interfaces/sort-by';

export const DEFAULT_PAGE_SIZE = 100;

export const parsePageOptions = (req: Request) => {
  const pageNumber = Number.parseInt(req.query.page_number as string, 10) || 1;
  const pageSize = Number.parseInt(req.query.page_size as string, 10) || DEFAULT_PAGE_SIZE;
  const query = qs.parse(req.originalUrl.split('?')[1]);
  const sortBy = parseSortBy(query.sort_by);

  return { pageNumber, pageSize, sortBy };
};
