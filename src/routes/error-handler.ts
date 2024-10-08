import { ErrorRequestHandler } from 'express';

import { appConfig } from '../config';
import { logger } from '../utils/logger';

const config = appConfig();
const cookieDomain = new URL(config.auth.jwt.cookieDomain).hostname;

export const errorHandler: ErrorRequestHandler = (err, req, res) => {
    const status = err.status || 500;

    switch (status) {
        case 401:
            logger.error('401 detected, logging user out');
            res.clearCookie('jwt', { domain: cookieDomain });
            res.redirect(`/${req.language}/auth/login`);
            break;

        case 404:
            res.status(404);
            res.render('errors/not-found');
            break;

        case 500:
        default:
            res.status(500);
            res.render('errors/server-error');
            break;
    }
};
