import path from 'path';

import pino from 'pino';
import express, { Application, Request, Response } from 'express';
import multer from 'multer';

import { processCSV } from './controllers/csv-processor';
import { apiRoute } from './route/api';
import { healthcheck } from './route/healthcheck';

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
    const page_number: number = Number.parseInt(req.body?.page_number, 10) || 1;
    const page_size: number = Number.parseInt(req.body?.page_size, 10) || 100;
    const processedCSV = await processCSV(req.file?.buffer, page_number, page_size);
    if (!processedCSV.success) res.status(400);
    res.render('upload', processedCSV);
});

export default app;
