import { NextFunction, Request, Response } from 'express';
import { CookiePreferences } from '../interfaces/cookie-preferences';

export const cookieBanner = (req: Request, res: Response, next: NextFunction) => {
  const cookiePreferences = req.cookies['cookiePref'] as CookiePreferences;
  res.locals.showCookieBanner = !cookiePreferences || cookiePreferences.showBanner;
  next();
};
