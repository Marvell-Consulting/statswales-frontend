import { Blob } from 'buffer';

import { Request, Response, Router } from 'express';
import multer from 'multer';

import { logger } from '../utils/logger';
import { ViewErrDTO } from '../dtos/view-dto';
import { i18next } from '../middleware/translation';
import { StatsWalesApi } from '../services/stats-wales-api';

const t = i18next.t;
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    const statsWalesApi = new StatsWalesApi(lang);

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
                            lang,
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
                            lang,
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

    const processedCSV = await statsWalesApi.uploadCSV(fileData, internalName);

    if (processedCSV.success) {
        res.redirect(`/${lang}/dataset/${processedCSV.dataset?.id}`);
    } else {
        res.status(400);
        res.render('publish/upload', processedCSV);
    }
});
