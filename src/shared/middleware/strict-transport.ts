import { Request, Response, NextFunction, Router } from 'express';
import helmet from 'helmet';

import { appConfig } from '../config';
import { AppEnv } from '../config/env.enum';

const config = appConfig();

const bypass = (re: Request, res: Response, next: NextFunction) => next();

export const strictTransport = [AppEnv.Ci, AppEnv.Local].includes(config.env)
  ? bypass
  : Router()
      .use(
        helmet({
          hsts: {
            maxAge: 63072000, // 2 years in seconds
            includeSubDomains: true,
            preload: true
          }
        })
      )
      .use(
        helmet.contentSecurityPolicy({
          directives: {
            defaultSrc: ['*'],
            styleSrc: [
              "'self'",
              "'unsafe-inline'",
              'https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/fira_code.min.css'
            ],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ['*', 'data:']
          }
        })
      );
