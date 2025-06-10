import { Router } from 'express';
import proxy from 'express-http-proxy';

import { appConfig } from '../config';

export const consumerApiProxy = Router();

const config = appConfig();
const apiUrl = `${config.backend.url}/v1`;

console.log(apiUrl);

consumerApiProxy.use(
  proxy(apiUrl, {
    proxyReqPathResolver: function (req) {
      const parts = req.url.split('?');
      const queryString = parts[1];
      const forwardUrl = `${apiUrl}${req.url}${queryString ? '?' + queryString : ''}`;

      console.log({ url: req.url, parts: parts[0], forwardUrl });
      return forwardUrl;
    }
  })
);
