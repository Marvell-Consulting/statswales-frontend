import { Blob } from 'buffer';

import { Request, Response, Router } from 'express';
import pino from 'pino';
import multer from 'multer';

import { ViewErrDTO } from '../dtos/view-dto';
import { t } from '../config/i18next';
import { API } from '../controllers/api';
import { ensureAuthenticated } from '../config/authenticate';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const APIInstance = new API();

const logger = pino({
    name: 'StatsWales-Alpha-App: Publish',
    level: 'debug'
});

export const publish = Router();

publish.get('/', ensureAuthenticated, (req: Request, res: Response) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    const altLang = req.i18n.language === 'en-GB' ? 'cy-GB' : 'en-GB';
    res.locals.currentPathAltLang = `/${altLang}/${req.i18n.t('routes.publish.start', { lng: altLang })}/`;
    res.render('publish/start');
});

publish.get('/title', ensureAuthenticated, (req: Request, res: Response) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.displayLanguage = req.i18n.language;
    const altLang = req.i18n.language === 'en-GB' ? 'cy-GB' : 'en-GB';
    res.locals.currentPathAltLang = `/${altLang}/${req.i18n.t('routes.publish.start', { lng: altLang })}/${req.i18n.t('routes.publish.title', { lng: altLang })}`;
    res.render('publish/title');
});

publish.get('/preview-data-table/:id', ensureAuthenticated, async (req: Request, res: Response) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    if (!req.params.id) {
        logger.debug('Datafile ID was missing on request');
        const err: ViewErrDTO = {
            success: false,
            status: 404,
            dataset_id: undefined,
            errors: [
                {
                    field: 'datafile_id',
                    message: [
                        {
                            lang: req.i18n.language,
                            message: t('publish.errors.datafile_missing')
                        }
                    ],
                    tag: {
                        name: 'publish.errors.datafile_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(404);
        res.render('publish/preview-data-table', err);
        return;
    }
    const datafileId = req.params.id;
    const page_number: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const page_size: number = Number.parseInt(req.query.page_size as string, 10) || 10;
    const altLang = req.i18n.language === 'en-GB' ? 'cy-GB' : 'en-GB';
    const currentPathAltLang = `/${altLang}/${req.i18n.t('routes.publish.start', { lng: altLang })}/${req.i18n.t('routes.publish.preview-data-table', { lng: altLang })}/${datafileId}`;
    res.locals.currentPathAltLang = currentPathAltLang;
    const file = await APIInstance.getPreviewFileData(req.i18n.language, datafileId, page_number, page_size);
    if (!file.success) {
        res.status((file as ViewErrDTO).status);
    }
    res.render('publish/preview-data-table', {
        isAuthenticated: req.isAuthenticated(),
        currentPathAltLang,
        user: req.user,
        data: file
    });
});

publish.post('/title', ensureAuthenticated, upload.none(), (req: Request, res: Response) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    const altLang = req.i18n.language === 'en-GB' ? 'cy-GB' : 'en-GB';
    const currentPathAltLang = `/${altLang}/${req.i18n.t('routes.publish.start', { lng: altLang })}/${req.i18n.t('routes.publish.title', { lng: altLang })}`;
    res.locals.currentPathAltLang = currentPathAltLang;
    if (!req.body?.displayLanguage) {
        logger.debug('Display Language was missing on request');
        const err: ViewErrDTO = {
            success: false,
            status: 400,
            dataset_id: undefined,
            errors: [
                {
                    field: 'displayLanguage',
                    message: [
                        {
                            lang: req.i18n.language,
                            message: t('publish.errors.languague_missing')
                        }
                    ],
                    tag: {
                        name: 'publish.errors.languague_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(400);
        res.render('publish/title', err);
        return;
    }
    const titleLanguage: string = req.body.displayLanguage;
    req.session.titleLanguage = titleLanguage;
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
                            message: t('publish.errors.title_missing')
                        }
                    ],
                    tag: {
                        name: 'publish.errors.title_missing',
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
    req.session.datasetTitle = title;
    req.session.save();
    res.render('publish/upload', { isAuthenticated: req.isAuthenticated(), currentPathAltLang, titleLanguage, title });
});

publish.post('/upload', ensureAuthenticated, upload.single('csv'), async (req: Request, res: Response) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    const altLang = req.i18n.language === 'en-GB' ? 'cy-GB' : 'en-GB';
    res.locals.currentPathAltLang = `/${altLang}/${req.i18n.t('routes.publish.start', { lng: altLang })}/${req.i18n.t('routes.publish.upload', { lng: altLang })}`;
    const lang = req.i18n.language;
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
                            message: t('publish.errors.title_missing')
                        }
                    ],
                    tag: {
                        name: 'publish.errors.title_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(400);
        res.render('publish/title', err);
        return;
    }
    logger.debug(`Title: ${req.body.title}`);
    const title: string = req.body.title;
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

    const processedCSV = await APIInstance.uploadCSV(lang, fileData, title);
    if (processedCSV.success) {
        // eslint-disable-next-line require-atomic-updates
        req.session.previewFactTableID = processedCSV.dataset?.id;
        req.session.save();
        res.redirect(`/${req.i18n.language}/publish/preview-data-table/${processedCSV.dataset?.id}`);
    } else {
        res.status(400);
        res.render('publish/upload', processedCSV);
    }
});

publish.post('/confirm-datatable', upload.none(), ensureAuthenticated, (req: Request, res: Response) => {
    // eslint-disable-next-line prettier/prettier
    const confirm: boolean = (req.body.confirm === 'true');
    if (!confirm) {
        res.redirect(`/${req.i18n.language}/publish/upload`);
        return;
    }
    res.json({ datatable: 'Datatable confirmed' });
});
