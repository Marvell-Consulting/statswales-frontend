import { Router, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { logger } from '../utils/logger';
import { JWTPayloadWithUser } from '../interfaces/jwt-payload-with-user';
import { appConfig } from '../config';

export const auth = Router();

const config = appConfig();
const cookieDomain = new URL(config.auth.jwt.cookieDomain).hostname;
logger.debug(`JWT cookie domain is '${cookieDomain}'`);

auth.get('/login', (req: Request, res: Response) => {
    if (req.query.error && req.query.error === 'expired') {
        logger.error(`Authentication token has expired`);
        res.status(400);
        res.render('auth/login', { errors: ['login.error.expired'] });
        return;
    }
    res.render('auth/login');
});

auth.get('/google', (req: Request, res: Response) => {
    logger.debug('Sending user to backend for google authentication');
    res.redirect(`${config.backend.url}/auth/google?lang=${req.language}`);
});

auth.get('/entraid', (req: Request, res: Response) => {
    logger.debug('Sending user to backend for entraid authentication');
    res.redirect(`${config.backend.url}/auth/entraid?lang=${req.language}`);
});

auth.get('/callback', (req: Request, res: Response) => {
    logger.debug('returning from auth backend');

    try {
        if (req.query.error) {
            throw new Error(`auth backend returned an error: ${req.query.error}`);
        }

        // the backend stores the JWT token in a cookie before retuning the user to the frontend
        if (!req.cookies.jwt) {
            throw new Error('JWT cookie not found');
        }

        const secret = config.auth.jwt.secret;
        const decoded = JWT.verify(req.cookies.jwt, secret) as JWTPayloadWithUser;
        req.user = decoded.user;
    } catch (err) {
        logger.error(`problem authenticating user ${err}`);
        res.status(400);
        res.render('auth/login', { errors: ['login.error.generic'] });
        return;
    }

    logger.debug('User successfully logged in');
    res.redirect(req.buildUrl('/', req.language));
});

auth.get('/logout', (req: Request, res: Response) => {
    logger.debug('logging out user');
    res.clearCookie('jwt', { domain: cookieDomain });
    res.redirect(req.buildUrl(`/auth/login`, req.language));
});
