import path from 'path';
import 'reflect-metadata';

import pino from 'pino';
import express, { Application, Request, Response } from 'express';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import multer from 'multer';
import { DataSourceOptions } from 'typeorm';

import { Datafile } from './entity/Datafile';
import { processCSV, uploadCSV, DEFAULT_PAGE_SIZE } from './controllers/csv-processor';
import { apiRoute } from './route/api';
import { healthcheck } from './route/healthcheck';
import { FileDescription } from './models/filelist';
import DatabaseManager from './database-manager';

// eslint-disable-next-line import/no-mutable-exports
export let dbManager: DatabaseManager;

export const connectToDb = async (datasourceOptions: DataSourceOptions) => {
    dbManager = new DatabaseManager(datasourceOptions);
    await dbManager.initializeDataSource();
};

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

const app: Application = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const logger = pino({
    name: 'StatsWales-Alpha-App',
    level: 'debug'
});

app.use(i18nextMiddleware.handle(i18next));
app.use('/:lang/api', apiRoute);
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

app.get('/:lang/upload', (req: Request, res: Response) => {
    res.render('upload');
});

app.post('/:lang/upload', upload.single('csv'), async (req: Request, res: Response) => {
    logger.debug(`Filename is ${req.body?.filename}`);
    if (!req.file) {
        res.status(400);
        res.render('upload', {
            success: false,
            headers: undefined,
            data: undefined,
            errors: [
                {
                    field: 'csv',
                    message: 'No CSV data available'
                }
            ]
        });
        return;
    }
    if (!req.body?.filename) {
        res.status(400);
        res.render('upload', {
            success: false,
            headers: undefined,
            data: undefined,
            errors: [
                {
                    field: 'filename',
                    message: 'No datasetname provided'
                }
            ]
        });
        return;
    }
    if (!req.body?.description) {
        res.status(400);
        res.render('upload', {
            success: false,
            headers: undefined,
            data: undefined,
            errors: [
                {
                    field: 'description',
                    message: 'No datasetname provided'
                }
            ]
        });
        return;
    }
    let datafile = new Datafile();
    datafile.name = req.body?.filename;
    datafile.description = req.body?.description;
    datafile = await datafile.save();
    const processedCSV = await uploadCSV(req.file?.buffer, `${datafile.id}.csv`);
    if (processedCSV.success) {
        res.redirect(`/${req.i18n.language}/data/?file=${datafile.id}`);
    } else {
        res.status(400);
        res.render('upload', processedCSV);
    }
});

app.get('/:lang/list', async (req: Request, res: Response) => {
    const datafiles = await Datafile.find();
    const fileList: FileDescription[] = [];
    for (const datafile of datafiles) {
        fileList.push({
            name: datafile.name,
            id: datafile.id,
            description: datafile.description
        });
    }
    console.log(datafiles);
    res.render('list', { filelist: fileList });
});

app.get('/:lang/data', async (req: Request, res: Response) => {
    const page_number: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const page_size: number = Number.parseInt(req.query.page_size as string, 10) || DEFAULT_PAGE_SIZE;
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
    const processedCSV = await processCSV(req.query.file.toString(), page_number, page_size);
    res.render('data', processedCSV);
});

export default app;
