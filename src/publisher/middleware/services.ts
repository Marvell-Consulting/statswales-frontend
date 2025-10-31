import { NextFunction, Request, Response } from 'express';

import { config } from '../../shared/config';
import { Locale } from '../../shared/enums/locale';
import { localeUrl } from '../../shared/middleware/language-switcher';
import { statusToColour } from '../../shared/utils/status-to-colour';
import { PublisherApi } from '../services/publisher-api';

// initialise any request-scoped services required by the app. See @types/express/index.d.ts for details
export const initServices = (req: Request, res: Response, next: NextFunction): void => {
  // for use in controllers (added to req)
  req.pubapi = new PublisherApi(req.language as Locale, req.cookies.jwt);
  req.buildUrl = localeUrl;

  // for use in templates (added to res.locals)
  res.locals.appEnv = config.env;
  res.locals.buildUrl = localeUrl;
  res.locals.statusToColour = statusToColour;
  res.locals.protocol = req.protocol;
  res.locals.hostname = req.hostname;
  res.locals.url = req.originalUrl;
  res.locals.referrer = req.get('Referrer');
  res.locals.supportEmail = req.language.includes('en') ? config.email.support.en : config.email.support.cy;

  next();
};
