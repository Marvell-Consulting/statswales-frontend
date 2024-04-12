import { Router } from 'express';
import pino from 'pino';

import { DataLakeService } from '../controllers/datalake';

export const logger = pino({
    name: 'StatsWales-Alpha-App: Healthcheck',
    level: 'debug'
});

const dataLakeService = new DataLakeService();
export const healthcheck = Router();

healthcheck.get('/', (req, res) => {
    const lang = req.i18n.language || 'en-GB';
    logger.info(`Healthcheck requested in ${lang}`);
    let statusMsg = req.t('app-running');
    try {
        dataLakeService.listFiles();
    } catch (err) {
        logger.error(`Unable to connect to datalake.  Returned the following error:\n${err}`);
        statusMsg = req.t('datalake-error');
    }

    res.json({
        status: statusMsg,
        notes: req.t('health-notes')
    });
});
