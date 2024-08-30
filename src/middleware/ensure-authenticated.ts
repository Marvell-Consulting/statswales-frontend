import { RequestHandler } from 'express';
import JWT from 'jsonwebtoken';

import { JWTPayloadWithUser } from '../interfaces/jwt-payload-with-user';
import { logger } from '../utils/logger';

export const ensureAuthenticated: RequestHandler = (req, res, next) => {
    logger.debug('checking if user is authenticated...');

    if (!req.cookies.jwt) {
        logger.error('JWT cookie not found');
        return res.redirect('/auth/login');
    }

    const secret = process.env.JWT_SECRET || '';
    const decoded = JWT.verify(req.cookies.jwt, secret) as JWTPayloadWithUser;

    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        logger.error('JWT token has expired');
        return res.redirect('/auth/login');
    }

    req.user = decoded.user;
    logger.info('user is authenticated');

    return next();
};
