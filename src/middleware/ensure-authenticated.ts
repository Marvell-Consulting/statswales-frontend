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

        // JWT_SECRET must be the same as the backend or the token will fail verification
        const secret = process.env.JWT_SECRET || '';
        const token = req.cookies.jwt;

        // verify the JWT token was signed by us
        const decoded = JWT.verify(token, secret) as JWTPayloadWithUser;

        if (decoded.exp && decoded.exp <= Date.now() / 1000) {
            logger.error('JWT token has expired');
            res.status(401);
            return res.redirect('/auth/login?error=expired');
        }

        // store the token string in the request as we need it for Authorization header in API requests
        req.jwt = token;
        logger.debug(`JWT: ${token}`);

        // store the user object in the request for use in the frontend
        req.user = decoded.user;
        logger.info('user is authenticated');
    } catch (err) {
        logger.error(`authentication failed: ${err}`);
        res.status(401);
        return res.redirect('/auth/login');
    }

    return next();
};