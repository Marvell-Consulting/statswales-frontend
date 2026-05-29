import { Request } from 'express';
import qs from 'qs';

import { parseSortBy } from '../interfaces/sort-by';
import { PAGE_NUMBER_CAP } from './pagination';

export const DEFAULT_PAGE_SIZE = 25;

export const parsePageOptions = (req: Request) => {
  // `parseInt(x, 10) > 0` rejects NaN, zero and negatives in one check.
  const parsedPage = Number.parseInt(req.query.page_number as string, 10);
  // Clamp to PAGE_NUMBER_CAP — the backend rejects anything higher with 400,
  // so silently capping here matches the cursor-aware UI: numbered jumps stop
  // at the cap, deeper navigation flows through next_cursor.
  const pageNumber = parsedPage > 0 ? Math.min(parsedPage, PAGE_NUMBER_CAP) : 1;

  const parsedSize = Number.parseInt(req.query.page_size as string, 10);
  const pageSize = parsedSize > 0 ? parsedSize : DEFAULT_PAGE_SIZE;

  const query = qs.parse(req.originalUrl.split('?')[1]);
  const sortBy = parseSortBy(query.sort_by);

  const rawCursor = req.query.cursor;
  const cursor = typeof rawCursor === 'string' && rawCursor.length > 0 ? rawCursor : undefined;

  return { pageNumber, pageSize, sortBy, cursor };
};
