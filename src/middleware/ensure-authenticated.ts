import { RequestHandler } from 'express';
import JWT from 'jsonwebtoken';

import { AuthedRequest } from '../interfaces/authed-request';
import { JWTPayloadWithUser } from '../interfaces/jwt-payload-with-user';
import { logger } from '../utils/logger';
import { appConfig } from '../config';
import { Locale } from '../enums/locale';

import { localeUrl } from './language-switcher';

const config = appConfig();

export const ensureAuthenticated: RequestHandler = (req: AuthedRequest, res, next) => {
    logger.debug(`checking if user is authenticated for route ${req.originalUrl}...`);

    const locale = req.language as Locale;

    try {
        if (!req.cookies.jwt) {
            throw new Error('JWT cookie not found');
        }

        // JWT_SECRET must be the same as the backend or the token will fail verification
        const secret = config.auth.jwt.secret;
        const token = req.cookies.jwt;

        // verify the JWT token was signed by us
        const decoded = JWT.verify(token, secret) as JWTPayloadWithUser;

        if (decoded.exp && decoded.exp <= Date.now() / 1000) {
            logger.error('JWT token has expired');
            res.status(401);
            return res.redirect(localeUrl('/auth/login', locale, { error: 'expired' }));
        }

        // store the token string in the request as we need it for Authorization header in API requests
        req.jwt = token;

        // store the user object in the request for use in the frontend
        req.user = decoded.user;
        res.locals.isAuthenticated = true;
        logger.info('user is authenticated');
    } catch (err) {
        logger.error(`authentication failed: ${err}`);
        res.status(401);
        return res.redirect(localeUrl('/auth/login', locale));
    }

    return next();
};
