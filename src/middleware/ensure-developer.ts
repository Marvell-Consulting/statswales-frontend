import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import { ForbiddenException } from '../exceptions/forbidden.exception';
import { GlobalRole } from '../enums/global-role';

export const ensureDeveloper = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`checking if user is a developer...`);

  try {
    const user = req.user;

    if (!user || !user.global_roles.includes(GlobalRole.Developer)) {
      throw new ForbiddenException('user is not a developer');
    }

    logger.info('user is a developer');
  } catch (err) {
    next(err);
  }

  return next();
};
