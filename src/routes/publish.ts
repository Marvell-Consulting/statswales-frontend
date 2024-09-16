import { Blob } from 'buffer';

import { Response, Router } from 'express';
import multer from 'multer';

import { logger } from '../utils/logger';
import { StatsWalesApi } from '../services/stats-wales-api';
import { ViewDTO, ViewErrDTO } from '../dtos2/view-dto';
import { i18next } from '../middleware/translation';
import { AuthedRequest } from '../interfaces/authed-request';

const t = i18next.t;
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const publish = Router();

publish.get('/', (req: AuthedRequest, res: Response) => {
    res.render('publish/start');
});

publish.get('/title', (req: AuthedRequest, res: Response) => {
    res.render('publish/title');
});

publish.post('/title', upload.none(), (req: AuthedRequest, res: Response) => {
    if (!req.body?.title) {
        logger.debug('Title was missing on request');
        const err: ViewErrDTO = {
            success: false,
            status: 400,
            dataset_id: undefined,
            errors: [
                {
                    field: 'title',
                    message: [
                        {
                            lang: req.i18n.language,
                            message: t('errors.title.missing')
                        }
                    ],
                    tag: {
                        name: 'errors.title.missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(400);
        res.render('publish/title', err);
        return;
    }
    const title: string = req.body.title;
    res.render('publish/upload', { title });
});

publish.post('/upload', upload.single('csv'), async (req: AuthedRequest, res: Response) => {
    const lang = req.i18n.language;
    const statsWalesApi = new StatsWalesApi(lang, req.jwt);

    if (!req.body?.title) {
        logger.debug('Internal name was missing on request');
        const err: ViewErrDTO = {
            success: false,
            status: 400,
            dataset_id: undefined,
            errors: [
                {
                    field: 'title',
                    message: [
                        {
                            lang,
                            message: t('errors.title.missing')
                        }
                    ],
                    tag: {
                        name: 'errors.title.missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(400);
        res.render('publish/title', err);
        return;
    }

    const title: string = req.body.title;

    if (!req.file) {
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

    const fileName = req.file?.originalname;
    const fileData = new Blob([req.file?.buffer], { type: req.file?.mimetype });

    const processedCSV = await statsWalesApi.uploadCSVtoCreateDataset(fileData, fileName, title);

    if (processedCSV.success) {
        // eslint-disable-next-line require-atomic-updates
        req.session.currentDataset = processedCSV.dataset;
        req.session.save();
        res.redirect(`/${lang}/publish/preview`);
    } else {
        res.status(400);
        res.render('publish/upload', processedCSV);
    }
});

publish.get('/preview', async (req: AuthedRequest, res: Response) => {
    const lang = req.i18n.language;
    const statsWalesApi = new StatsWalesApi(lang, req.jwt);

    const dataset = req.session.currentDataset;
    if (!dataset) {
        logger.error('No dataset in session');
        res.redirect(`/${req.i18n.language}/publish/title`);
        return;
    }

    const page_number: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const page_size: number = Number.parseInt(req.query.page_size as string, 10) || 10;
    const previewData = await statsWalesApi.getDatasetDatafilePreview(
        dataset.id,
        dataset.revisions[0].id,
        dataset.revisions[0].imports[0].id,
        page_number,
        page_size
    );
    if (!previewData.success) {
        logger.error('Failed to get preview data from the backend');
        res.status(500);
        res.render('publish/start');
    }
    const data = previewData as ViewDTO;
    res.render('publish/preview', data);
});

publish.post('/confirm', upload.none(), (req: AuthedRequest, res: Response) => {
    const dataset = req.session.currentDataset;
    if (!dataset) {
        logger.debug('No dataset in session');
        res.redirect(`/${req.i18n.language}/publish/title`);
        return;
    }
    const lang = req.i18n.language;
    const confirmData = req.body?.confirm;
    if (!confirmData) {
        logger.debug('No confirmation data was provided');
        const err: ViewErrDTO = {
            success: false,
            status: 400,
            dataset_id: dataset.id,
            errors: [
                {
                    field: 'confirm',
                    message: [
                        {
                            lang,
                            message: t('errors.confirm.missing')
                        }
                    ],
                    tag: {
                        name: 'errors.confirm.missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(400);
        res.render('publish/preview', err);
        return;
    }
    if (confirmData === 'true') {
        res.status(200);
        res.json({ confirm: true, dataset_id: dataset.id, message: 'Datatable has been confirmed as correct' });
    } else {
        res.status(200);
        res.json({ confirm: false, dataset_id: dataset.id, message: 'Datatable has been rejected as incorrect' });
    }
});
