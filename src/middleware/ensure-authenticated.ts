import { RequestHandler } from 'express';

export const ensureAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // If not authenticated, redirect to login page
    return res.redirect('/auth/login');
};
