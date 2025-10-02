import { NextFunction, Request, Response } from 'express';
import { DateArg, format, parseISO } from 'date-fns';
import { enGB, cy } from 'date-fns/locale';

import { appConfig } from '../../shared/config';
import { Locale } from '../../shared/enums/locale';
import { PublisherApi } from '../services/publisher-api';

import { localeUrl } from '../../shared/middleware/language-switcher';
import { statusToColour } from '../../shared/utils/status-to-colour';
import { TZDate } from '@date-fns/tz';

const config = appConfig();

const dateFormat = (date: DateArg<Date> & {}, formatStr: string, options?: any): string => {
  const tzDate = new TZDate(date as Date, 'Europe/London');
  if (options?.locale) {
    options.locale = options.locale.includes('cy') ? cy : enGB;
  }
  return format(tzDate, formatStr, options);
};

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
  res.locals.parseISO = parseISO;
  res.locals.dateFormat = dateFormat;
  res.locals.supportEmail = req.language.includes('en') ? config.email.support.en : config.email.support.cy;

  next();
};
