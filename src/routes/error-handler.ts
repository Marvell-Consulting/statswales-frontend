import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { appConfig } from '../config';
import { logger } from '../utils/logger';

const config = appConfig();
const cookieDomain = new URL(config.auth.jwt.cookieDomain).hostname;

export const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    switch (err.status) {
        case 401:
            logger.error('401 error detected, logging user out');
            res.clearCookie('jwt', { domain: cookieDomain });
            res.redirect(`/${req.language}/auth/login`);
            break;

        case 404:
            logger.error(`404 error detected for ${req.originalUrl}, rendering not-found page`);
            res.status(404);
            res.render('errors/not-found');
            break;

        case 500:
        default:
            logger.error(`unknown error detected for ${req.originalUrl}, rendering error page`);
            res.status(500);
            res.render('errors/server-error');
            break;
    }
};
