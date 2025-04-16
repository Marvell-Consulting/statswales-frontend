import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import { ForbiddenException } from '../exceptions/forbidden.exception';

export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`checking if user is a service admin...`);
  if (!res.locals.isAdmin) {
    next(new ForbiddenException('user is not a service admin'));
    return;
  }
  logger.info(`user is a service admin`);
  next();
};
