import { Request } from 'express';
import qs from 'qs';

import { parseSortBy } from '../interfaces/sort-by';

export const DEFAULT_PAGE_SIZE = 25;

export const parsePageOptions = (req: Request) => {
  // `parseInt(x, 10) > 0` rejects NaN, zero and negatives in one check.
  const parsedPage = Number.parseInt(req.query.page_number as string, 10);
  const pageNumber = parsedPage > 0 ? parsedPage : 1;

  const parsedSize = Number.parseInt(req.query.page_size as string, 10);
  const pageSize = parsedSize > 0 ? parsedSize : DEFAULT_PAGE_SIZE;

  const query = qs.parse(req.originalUrl.split('?')[1]);
  const sortBy = parseSortBy(query.sort_by);

  return { pageNumber, pageSize, sortBy };
};
