import { NextFunction, Request, Response } from 'express';
import { omit, PropertyName } from 'lodash';
import qs from 'qs';

export const clearParams = (req: Request, res: Response, next: NextFunction) => {
  const [url, queryString] = req.originalUrl.split('?');
  const query = qs.parse(queryString);
  if (!query._clear) {
    return next();
  }

  const fields = Array.isArray(query._clear) ? query._clear : [query._clear];

  if (!fields.length) {
    return next();
  }

  const newQuery = omit(query, ['_clear', ...(fields as PropertyName[])]);

  return res.redirect(`${url}?${qs.stringify(newQuery)}`);
};
