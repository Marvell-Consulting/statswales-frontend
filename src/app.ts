import path from 'path';
import { Blob } from 'buffer';

import pino from 'pino';
import express, { Application, Request, Response } from 'express';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import multer from 'multer';

import { API } from './controllers/api';
import { healthcheck } from './route/healthcheck';
import { FileList } from './dtos/filelist';

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

export const logger = pino({
    name: 'StatsWales-Alpha-App',
    level: 'debug'
});

const app: Application = express();
const APIInstance = new API(logger);
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(i18nextMiddleware.handle(i18next));
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

app.get('/:lang/', (req: Request, res: Response) => {
    res.render('index');
});

app.get('/:lang/publish', (req: Request, res: Response) => {
    res.render('publish/start');
});

app.get('/:lang/publish/name', (req: Request, res: Response) => {
    res.render('publish/name');
});

app.post('/:lang/publish/name', upload.none(), (req: Request, res: Response) => {
    if (!req.body?.internal_name) {
        logger.debug('Internal name was missing on request');
        res.status(400);
        res.render('publish/name', {
            success: false,
            headers: undefined,
            data: undefined,
            errors: [
                {
                    field: 'internal_name',
                    message: 'No dataset name provided'
                }
            ]
        });
        return;
    }
    const internalName: string = req.body.internal_name;
    res.render('publish/upload', { internal_name: internalName });
});

app.post('/:lang/publish/upload', upload.single('csv'), async (req: Request, res: Response) => {
    const lang = req.params.lang;
    if (!req.body?.internal_name) {
        logger.debug('Internal name was missing on request');
        res.status(400);
        res.render('publish/name', {
            success: false,
            headers: undefined,
            data: undefined,
            errors: [
                {
                    field: 'internal_name',
                    message: 'No dataset name provided'
                }
            ]
        });
        return;
    }
    logger.debug(`Internal name: ${req.body.internal_name}`);
    const internalName: string = req.body.internal_name;
    if (!req.file) {
        logger.debug('Attached file was missing on this request');
        res.status(400);
        res.render('publish/upload', {
            success: false,
            headers: undefined,
            data: undefined,
            internal_name: internalName,
            errors: [
                {
                    field: 'csv',
                    message: 'No CSV data available'
                }
            ]
        });
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

app.get('/:lang/list', async (req: Request, res: Response) => {
    const lang = req.params.lang;
    const fileList: FileList = await APIInstance.getFileList(lang);
    res.render('list', fileList);
});

app.get('/:lang/data', async (req: Request, res: Response) => {
    const lang = req.params.lang;
    const page_number: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const page_size: number = Number.parseInt(req.query.page_size as string, 10) || 100;

    if (!req.query.file) {
        res.status(400);
        res.render('data', {
            success: false,
            headers: undefined,
            data: undefined,
            errors: [
                {
                    field: 'file',
                    message: 'No filename provided'
                }
            ]
        });
        return;
    }

    const file_id = req.query.file.toString();
    const file = await APIInstance.getFileData(lang, file_id, page_number, page_size);
    res.render('data', file);
});

export default app;
