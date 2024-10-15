import { RequestHandler } from 'express';

import { logger } from '../utils/logger';

export const skipMap: RequestHandler = (req, res, next) => {
    if (req.path.match(/\.map$/i)) {
        // logger.debug(`skipping source map request for ${req.originalUrl}`);
        res.send('');
        return;
    }
    next();
};
