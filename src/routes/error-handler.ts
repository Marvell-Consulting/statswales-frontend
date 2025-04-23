import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { appConfig } from '../config';
import { logger } from '../utils/logger';

const config = appConfig();
const cookieDomain = new URL(config.auth.jwt.cookieDomain).hostname;

export const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  switch (err.status) {
    case 401:
      logger.error('401 error detected, logging user out');
      res.status(401);
      res.clearCookie('jwt', { domain: cookieDomain });
      res.redirect(req.buildUrl(`/auth/login`, req.language));
      break;

    case 403:
      logger.error(`403 error detected: ${err.message}`);
      res.status(403);
      res.render('errors/forbidden');
      break;

    case 404:
      logger.error(`404 error detected for ${req.originalUrl}, rendering not-found page`);
      res.status(404);
      res.render('errors/not-found');
      break;

    case 500:
    default:
      logger.error(err, `error detected for ${req.originalUrl}, rendering error page`);
      res.status(500);
      res.render('errors/server-error');
      break;
  }
};
