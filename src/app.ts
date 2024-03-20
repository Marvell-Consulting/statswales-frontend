import path from 'path';

import pino from 'pino';
import express, { Application, Request, Response } from 'express';
import multer from 'multer';

import { processCSV, uploadCSV } from './controllers/csv-processor';
import { apiRoute } from './route/api';
import { healthcheck } from './route/healthcheck';
import { listFilesInDirectory } from './controllers/datalake';

const app: Application = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const logger = pino({
    name: 'StatsWales-Alpha-App',
    level: 'debug'
});

app.use('/api', apiRoute);
app.use('/healthcheck', healthcheck);
app.use('/public', express.static(`${__dirname}/public`));
app.use('/css', express.static(`${__dirname}/css`));
app.use('/assets', express.static(`${__dirname}/assets`));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req: Request, res: Response) => {
    res.render('index');
});

app.get('/upload', (req: Request, res: Response) => {
    res.render('upload');
});

app.post('/upload', upload.single('csv'), async (req: Request, res: Response) => {
    logger.debug(`Filename is ${req.body?.filename}`);
    const processedCSV = await uploadCSV(req.file?.buffer, req.body?.filename);
    if (processedCSV.success) {
        res.redirect(`/data/?file=${req.body?.filename}`);
    } else {
        res.status(400);
        res.render('upload', processedCSV);
    }
});

app.get('/list', async (req: Request, res: Response) => {
    const fileList = await listFilesInDirectory();
    res.render('list', { filelist: fileList });
});

app.get('/data', async (req: Request, res: Response) => {
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
                    message: 'No file name provided'
                }
            ]
        });
        return;
    }
    const processedCSV = await processCSV(req.query.file.toString(), page_number, page_size);
    res.render('data', processedCSV);
});

export default app;
