import { NextFunction, Request, Response } from 'express';
import { add, format, parseISO } from 'date-fns';

import { Locale } from '../enums/locale';
import { StatsWalesApi } from '../services/stats-wales-api';

import { localeUrl } from './language-switcher';

// initialise any request-scoped services required by the app and store them on the request object for later use
// see interfaces/service-container.ts and @types/express/index.d.ts for details
export const initServices = (req: Request, res: Response, next: NextFunction): void => {
    if (!/^\/(public|css|assets)/.test(req.originalUrl)) {
        const statsWalesApi = new StatsWalesApi(req.language as Locale, req.cookies.jwt);
        req.swapi = statsWalesApi;
        req.buildUrl = localeUrl; // for controllers
        res.locals.buildUrl = localeUrl; // for templates
        res.locals.url = req.originalUrl; // Allows the passing through of the URL
        res.locals.referrer = req.get('Referrer');
        res.locals.parseISO = parseISO;
        res.locals.dateFormat = format;
        res.locals.dateAdd = add;
        res.locals.languague = req.language;
    }
    next();
};
