import { NextFunction, Request, Response } from 'express';

import { config } from '../../shared/config';
import { Locale } from '../../shared/enums/locale';
import { localeUrl } from '../../shared/middleware/language-switcher';
import { ConsumerApi } from '../services/consumer-api';

// initialise any request-scoped services required by the app. See @types/express/index.d.ts for details
export const initServices = (req: Request, res: Response, next: NextFunction): void => {
  // for use in controllers (added to req)
  req.conapi = new ConsumerApi(req.language as Locale);
  req.buildUrl = localeUrl;

  // for use in templates (added to res.locals)
  res.locals.appEnv = config.env;
  res.locals.buildUrl = localeUrl;
  res.locals.protocol = req.protocol;
  res.locals.hostname = req.hostname;
  res.locals.url = req.originalUrl;
  res.locals.referrer = req.get('Referrer');
  res.locals.supportEmail = req.language.includes('en') ? config.email.support.en : config.email.support.cy;

  next();
};
