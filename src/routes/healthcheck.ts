import { Router } from 'express';

import { StatsWalesApi } from '../services/stats-wales-api';
import { logger } from '../utils/logger';

export const healthcheck = Router();

healthcheck.get('/', async (req, res) => {
    const lang = req.language;
    const APIInstance = new StatsWalesApi(lang);
    logger.info(`Healthcheck requested in ${lang}`);

    const statusMsg = req.t('app-running');
    const beConnected = await APIInstance.ping();

    res.json({
        status: statusMsg,
        notes: req.t('health-notes'),
        services: {
            backend_connected: beConnected
        }
    });
});
