import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import { User } from '../interfaces/user.interface';
import { ForbiddenException } from '../exceptions/forbidden.exception';

export const ensureDeveloper = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`checking if user is a developer...`);

  try {
    const user = req.user as User;
    // TODO: replace with role based perms once available
    if (!user || !user.email.includes('@marvell-consulting.com')) {
      throw new ForbiddenException('user is not a developer');
    }
    logger.info('user is a developer');
  } catch (err) {
    next(err);
  }

  return next();
};
