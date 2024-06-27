import path from 'path';
import { Blob } from 'buffer';

import pino from 'pino';
import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import multer from 'multer';

// eslint-disable-next-line import/no-cycle
import { API } from './controllers/api';
import { healthcheck } from './route/healthcheck';
import { FileList } from './dtos/filelist';
import { ViewErrDTO } from './dtos/view-dto';
import passport, { auth } from './config/auth_config';
import { ensureAuthenticated } from './config/authenticate';

i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        detection: {
            order: ['path', 'header'],
            lookupHeader: 'accept-language',
            caches: false,
            ignoreRoutes: ['/healthcheck', '/public', '/css', '/assets']
        },
        backend: {
            loadPath: `${__dirname}/resources/locales/{{lng}}.json`
        },
        fallbackLng: 'en-GB',
        preload: ['en-GB', 'cy-GB'],
        debug: false
    });

export const i18n = i18next;
export const t = i18next.t;
export const ENGLISH = 'en-GB';
export const WELSH = 'cy-GB';

export const logger = pino({
    name: 'StatsWales-Alpha-App',
    level: 'debug'
});

const app: Application = express();
const APIInstance = new API();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(i18nextMiddleware.handle(i18next));
app.use('/auth', auth);
app.use('/:lang/healthcheck', healthcheck);
app.use('/healthcheck', healthcheck);
app.use('/public', express.static(`${__dirname}/public`));
app.use('/css', express.static(`${__dirname}/css`));
app.use('/assets', express.static(`${__dirname}/assets`));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req: Request, res: Response) => {
    const lang = req.headers['accept-language'] || req.headers['Accept-Language'] || req.i18n.language || 'en-GB';
    if (lang.includes('cy')) {
        res.redirect('/cy-GB');
    } else {
        res.redirect('/en-GB');
    }
});

app.get('/:lang/', ensureAuthenticated, (req: Request, res: Response) => {
    res.render('index');
});

app.get('/:lang/publish', ensureAuthenticated, (req: Request, res: Response) => {
    res.render('publish/start');
});

app.get('/:lang/publish/name', ensureAuthenticated, (req: Request, res: Response) => {
    res.render('publish/name');
});

app.post('/:lang/publish/name', ensureAuthenticated, upload.none(), (req: Request, res: Response) => {
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

app.post('/:lang/publish/upload', ensureAuthenticated, upload.single('csv'), async (req: Request, res: Response) => {
    const lang = req.params.lang;
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
        res.redirect(`/${req.i18n.language}/data/?file=${processedCSV.dataset?.id}`);
    } else {
        res.status(400);
        res.render('publish/upload', processedCSV);
    }
});

app.get('/:lang/list', ensureAuthenticated, async (req: Request, res: Response) => {
    const lang = req.params.lang;
    const fileList: FileList = await APIInstance.getFileList(lang);
    res.render('list', fileList);
});

app.get('/:lang/data/:file', ensureAuthenticated, async (req: Request, res: Response) => {
    const lang = req.params.lang;
    const page_number: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const page_size: number = Number.parseInt(req.query.page_size as string, 10) || 100;

    if (!req.params.file) {
        const err: ViewErrDTO = {
            success: false,
            status: 404,
            dataset_id: undefined,
            errors: [
                {
                    field: 'file',
                    message: [
                        {
                            lang: req.i18n.language,
                            message: t('errors.dataset_missing')
                        }
                    ],
                    tag: {
                        name: 'errors.dataset_missing',
                        params: {}
                    }
                }
            ]
        };
        res.status(404);
        res.render('data', err);
        return;
    }

    const file_id = req.params.file;
    const file = await APIInstance.getFileData(lang, file_id, page_number, page_size);
    if (!file.success) {
        res.status((file as ViewErrDTO).status);
    }
    res.render('data', file);
});

export default app;
