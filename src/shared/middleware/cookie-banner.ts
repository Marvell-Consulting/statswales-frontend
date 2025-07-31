import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { CookiePreferences } from '../interfaces/cookie-preferences';

export const cookieBanner = (req: Request, res: Response, next: NextFunction) => {
  const cookiePreferences = req.cookies['cookiePref'] as CookiePreferences;
  res.locals.showCookieBanner = !cookiePreferences || cookiePreferences.showBanner;

  if (res.locals.showCookieBanner) {
    logger.debug('new visitor or user previously refused cookies - displaying cookie banner');
  }

  next();
};
