import path from 'path';

import express, { Application, Request, Response } from 'express';

import { apiRoute } from './route/api';
import { healthcheck } from './route/healthcheck';

const app: Application = express();

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

export default app;
