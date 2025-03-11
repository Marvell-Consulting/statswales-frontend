import { NextFunction, Request, Response } from 'express';
import { DateArg, format, parseISO } from 'date-fns';
import { enGB, cy } from 'date-fns/locale';

import { appConfig } from '../config';
import { Locale } from '../enums/locale';
import { PublisherApi } from '../services/publisher-api';
import { ConsumerApi } from '../services/consumer-api';

import { localeUrl } from './language-switcher';

const config = appConfig();

const dateFormat = (date: DateArg<Date> & {}, formatStr: string, options?: any): string => {
  if (options?.locale) {
    options.locale = options.locale.includes('cy') ? cy : enGB;
  }
  return format(date, formatStr, options);
};

// initialise any request-scoped services required by the app and store them on the request object for later use
// see @types/express/index.d.ts for details
export const initServices = (req: Request, res: Response, next: NextFunction): void => {
  if (!/^\/(public|css|assets)/.test(req.originalUrl)) {
    req.pubapi = new PublisherApi(req.language as Locale, req.cookies.jwt);
    req.conapi = new ConsumerApi(req.language as Locale);
    req.buildUrl = localeUrl; // for controllers
    res.locals.buildUrl = localeUrl; // for templates
    res.locals.url = req.originalUrl; // Allows the passing through of the URL
    res.locals.referrer = req.get('Referrer');
    res.locals.parseISO = parseISO;
    res.locals.dateFormat = dateFormat;
    res.locals.supportEmail = config.supportEmail;
  }
  next();
};
