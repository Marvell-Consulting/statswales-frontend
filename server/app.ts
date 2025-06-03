import 'react-router';
import { createRequestHandler } from '@react-router/express';
import express, { type Request, type Response } from 'express';
import { type unstable_InitialContext } from 'react-router';
import { appConfig } from '../app/config';
import { appConfigContext } from '~/context/appContext.server';
import { logger } from '~/utils/logger.server';

declare module 'react-router' {
  interface AppLoadContext extends unstable_InitialContext {}
}

const config = appConfig();

export const app = express();

app.get('/.well-known/appspecific/com.chrome.devtools.json', () => {});

app.get('/:lang/auth/google', (req: Request, res: Response) => {
  logger.debug('Sending user to backend for google authentication');
  res.redirect(`${config.backend.url}/auth/google?lang=${req.params.lang}`);
});

app.get('/:lang/auth/entraid', (req: Request, res: Response) => {
  logger.debug('Sending user to backend for entraid authentication');
  res.redirect(`${config.backend.url}/auth/entraid?lang=${req.params.lang}`);
});

app.use(
  createRequestHandler({
    build: () => import('virtual:react-router/server-build'),
    getLoadContext: (req, res): unstable_InitialContext => {
      let map = new Map();
      map.set(appConfigContext, config);
      return map;
    }
  })
);
