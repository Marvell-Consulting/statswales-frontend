import { RequestHandler } from 'express';
import JWT from 'jsonwebtoken';

import { AuthedRequest } from '../interfaces/authed-request';
import { JWTPayloadWithUser } from '../interfaces/jwt-payload-with-user';
import { logger } from '../utils/logger';

export const ensureAuthenticated: RequestHandler = (req: AuthedRequest, res, next) => {
    logger.debug('checking if user is authenticated...');

    try {
        if (!req.cookies.jwt) {
            throw new Error('JWT cookie not found');
        }

        const secret = process.env.JWT_SECRET || '';
        const token = req.cookies.jwt;
        const decoded = JWT.verify(token, secret) as JWTPayloadWithUser;

        if (decoded.exp && decoded.exp <= Date.now() / 1000) {
            throw new Error('JWT token has expired');
        }

        // store the token string as we need it for the auth header in the API requests
        req.jwt = token;
        req.user = decoded.user;
        logger.info('user is authenticated');
    } catch (err) {
        logger.error(err);
        res.status(401);
        return res.redirect('/auth/login?error=unauthenticated');
    }

    return next();
};
