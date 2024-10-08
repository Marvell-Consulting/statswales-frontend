import { Router } from 'express';

import { StatsWalesApi } from '../services/stats-wales-api';
import { logger } from '../utils/logger';

export const healthcheck = Router();

healthcheck.get('/', async (req, res) => {
    const lang = req.language;
    logger.info(`Healthcheck requested in ${lang}`);
    const beConnected = await new StatsWalesApi(lang).ping();
    res.json({ status: 200, lang: req.language, services: { backend: beConnected } });
});
