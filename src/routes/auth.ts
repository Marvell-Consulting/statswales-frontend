import { Router, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { logger } from '../utils/logger';
import { JWTPayloadWithUser } from '../interfaces/jwt-payload-with-user';

export const auth = Router();

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
    res.redirect(`${process.env.BACKEND_URL}/auth/google`);
});

auth.get('/onelogin', (req: Request, res: Response) => {
    logger.debug('Sending user to backend for onelogin authentication');
    res.redirect(`${process.env.BACKEND_URL}/auth/onelogin`);
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

        const secret = process.env.JWT_SECRET || '';
        const decoded = JWT.verify(req.cookies.jwt, secret) as JWTPayloadWithUser;
        req.user = decoded.user;
    } catch (err) {
        logger.error(`problem authenticating user ${err}`);
        res.status(400);
        res.render('auth/login', { errors: ['login.error.generic'] });
        return;
    }

    logger.debug('User successfully logged in');
    res.redirect('/');
});

auth.get('/logout', (req: Request, res: Response) => {
    res.clearCookie('jwt');
    res.redirect('/auth/login');
});
