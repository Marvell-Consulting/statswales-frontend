import { Router, Request, Response, NextFunction } from 'express';

import { StatsWalesApi } from '../services/stats-wales-api';
import { Locale } from '../enums/locale';
import { logger } from '../utils/logger';

export const healthcheck = Router();

healthcheck.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const lang = req.language as Locale;
    let backend = false;
    logger.info(`Healthcheck requested in ${lang}`);

    try {
        backend = await new StatsWalesApi(lang).ping();
    } catch (err: any) {
        next(err);
    }
    res.json({ status: 200, lang: req.language, services: { backend } });
});
