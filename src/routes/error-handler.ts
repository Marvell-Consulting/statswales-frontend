import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const status = err.status || 500;

    switch (status) {
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
