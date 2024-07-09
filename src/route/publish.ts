import { Blob } from 'buffer';

import { Request, Response, Router } from 'express';
import pino from 'pino';
import multer from 'multer';

import { ViewErrDTO } from '../dtos/view-dto';
import { t } from '../config/i18next';
import { API } from '../controllers/api';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const APIInstance = new API();

const logger = pino({
    name: 'StatsWales-Alpha-App: Publish',
    level: 'debug'
});

export const publish = Router();

publish.get('/', (req: Request, res: Response) => {
    res.render('publish/start');
});

publish.get('/name', (req: Request, res: Response) => {
    res.render('publish/name');
});

publish.get('/title', (req: Request, res: Response) => {
    res.render('publish/title');
});

publish.post('/name', upload.none(), (req: Request, res: Response) => {
    if (!req.body?.internal_name) {
        logger.debug('Internal name was missing on request');
        const err: ViewErrDTO = {
            success: false,
            status: 400,
            dataset_id: undefined,
            errors: [
                {
                    field: 'internal_name',
                    message: [
                        {
                            lang: req.i18n.language,
                            message: t('errors.name_missing')
                        }
                    ],
                    tag: {
                        name: 'errors.name_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(400);
        res.render('publish/name', err);
        return;
    }
    const internalName: string = req.body.internal_name;
    res.render('publish/upload', { internal_name: internalName });
});

publish.post('/upload', upload.single('csv'), async (req: Request, res: Response) => {
    const lang = req.i18n.language;
    if (!req.body?.internal_name) {
        logger.debug('Internal name was missing on request');
        const err: ViewErrDTO = {
            success: false,
            status: 400,
            dataset_id: undefined,
            errors: [
                {
                    field: 'internal_name',
                    message: [
                        {
                            lang: req.i18n.language,
                            message: t('errors.name_missing')
                        }
                    ],
                    tag: {
                        name: 'errors.name_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(400);
        res.render('publish/name', err);
        return;
    }
    logger.debug(`Internal name: ${req.body.internal_name}`);
    const internalName: string = req.body.internal_name;
    if (!req.file) {
        logger.debug('Attached file was missing on this request');
        const err: ViewErrDTO = {
            success: false,
            status: 400,
            dataset_id: undefined,
            errors: [
                {
                    field: 'csv',
                    message: [
                        {
                            lang: req.i18n.language,
                            message: t('errors.upload.no-csv-data')
                        }
                    ],
                    tag: {
                        name: 'errors.upload.no-csv-data',
                        params: {}
                    }
                }
            ]
        };
        res.status(400);
        res.render('publish/upload', err);
        return;
    }

    const fileData = new Blob([req.file?.buffer]);

    const processedCSV = await APIInstance.uploadCSV(lang, fileData, internalName);
    if (processedCSV.success) {
        res.redirect(`/${req.i18n.language}/dataset/${processedCSV.dataset?.id}`);
    } else {
        res.status(400);
        res.render('publish/upload', processedCSV);
    }
});
