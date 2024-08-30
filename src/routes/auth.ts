import { Router, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { logger } from '../utils/logger';
import { JWTPayloadWithUser } from '../interfaces/jwt-payload-with-user';

export const auth = Router();

auth.get('/login', (req: Request, res: Response) => {
    res.render('auth/login');
});

auth.get('/google', (req: Request, res: Response) => {
    logger.debug('Sending user to backend for authentication');
    res.redirect(`${process.env.BACKEND_URL}/auth/google`);
});

auth.get('/callback', (req: Request, res: Response) => {
    logger.debug('returning from auth backend');

    try {
        if (!req.cookies.jwt) {
            logger.error('JWT cookie not found');
            throw new Error('JWT cookie not found');
        }

        if (req.query.error) {
            logger.error(`Error from auth backend: ${req.query.error}`);
            throw new Error(`Error from auth backend: ${req.query.error}`);
        }

        const secret = process.env.JWT_SECRET || '';
        const decoded = JWT.verify(req.cookies.jwt, secret) as JWTPayloadWithUser;
        req.user = decoded.user;
    } catch (err) {
        logger.error(`Error verifying JWT: ${err}`);
        res.status(400);
        res.render('auth/login', { errors: ['login.error.message'] });
        return;
    }
    console.log(req.user);
    logger.debug('User successfully logged in');
    res.redirect('/');
});

auth.get('/logout', (req: Request, res: Response) => {
    res.clearCookie('jwt');
    res.redirect('/auth/login');
});
