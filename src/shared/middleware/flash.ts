import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';

export const flashErrors = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.errors) {
    logger.debug('Errors found in session, saving to locals for view and clearing');
    res.locals.errors = req.session.errors;
    delete req.session.errors;
  }
  next();
};

export const flashMessages = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.flash) {
    logger.debug('Message found in session, saving to locals for view and clearing');
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  }
  next();
};
