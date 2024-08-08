import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line consistent-return
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }
    // If not authenticated, redirect to login pag
    res.cookie('returnTo', req.originalUrl, { maxAge: 900000 });
    res.redirect('/auth/login');
}
