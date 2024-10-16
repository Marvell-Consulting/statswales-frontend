import { NextFunction, Request, Response } from 'express';

import { Locale } from '../enums/locale';
import { StatsWalesApi } from '../services/stats-wales-api';

import { localeUrl } from './language-switcher';

// initialise any request-scoped services required by the app and store them on the request object for later use
// see interfaces/service-container.ts and @types/express/index.d.ts for details
export const initServices = (req: Request, res: Response, next: NextFunction): void => {
    req.swapi = new StatsWalesApi(req.language as Locale, req.jwt);
    req.buildUrl = localeUrl; // for controllers
    res.locals.buildUrl = localeUrl; // for templates
    next();
};
