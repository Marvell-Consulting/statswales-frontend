import { Router } from 'express';

import { StatsWalesApi } from '../services/stats-wales-api';
import { logger } from '../utils/logger';
import { Locale } from '../enums/locale';

export const healthcheck = Router();

healthcheck.get('/', async (req, res) => {
    const lang = req.language as Locale;
    let backend = false;
    logger.info(`Healthcheck requested in ${lang}`);

    try {
        backend = await new StatsWalesApi(lang).ping();
    } catch (error) {
        logger.error('backend ping failed');
    }
    res.json({ status: 200, lang: req.language, services: { backend } });
});
