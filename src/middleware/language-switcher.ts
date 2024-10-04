import { RequestHandler, Request } from 'express';
import { omit } from 'lodash';

import { logger } from '../utils/logger';
import { appConfig } from '../config';
import { AppEnv } from '../config/env.enum';

import { ignoreRoutes, ENGLISH, ENGLISH_GB, WELSH, WELSH_GB } from './translation';

const config = appConfig();

const localeUrl = (req: Request, locale: string): string => {
    const { protocol, hostname, path, query } = req;
    const port = config.env === AppEnv.Local ? config.frontend.port : undefined;

    // the language switching links use the lang=xxx query param, but once triggered we want to remove it
    // while keeping all other query params
    const queryParams = omit(query, 'lang') as Record<string, string>;
    const queryString = new URLSearchParams(queryParams).toString();
    const qs = queryString ? `?${queryString}` : '';

    const baseUrl = `${protocol}://${hostname}${port ? `:${port}` : ''}`;

    // remove the previous language from the path if present
    const cleanPath = path.replace(/^\/(en|cy)(-GB)?/, '');

    return `${baseUrl}/${locale}${cleanPath}${qs}`;
};

export const languageSwitcher: RequestHandler = (req, res, next): void => {
    const ignoreUrls = new RegExp(`^(${ignoreRoutes.join('|')})`);

    if (ignoreUrls.test(req.originalUrl)) {
        next();
        return;
    }

    const lang = req.language; // language detected by the i18next middleware in ./translation.ts

    if ([ENGLISH, ENGLISH_GB].includes(lang) && !/^\/en-GB/.test(req.originalUrl)) {
        const newUrl = localeUrl(req, ENGLISH_GB);
        logger.debug(`Language detected as '${lang}' but not present in path, redirecting to ${newUrl}`);
        res.redirect(newUrl);
        return;
    }

    if ([WELSH, WELSH_GB].includes(lang) && !/^\/cy-GB/.test(req.originalUrl)) {
        const newUrl = localeUrl(req, WELSH_GB);
        logger.debug(`Language detected as '${lang}' but not present in path, redirecting to ${newUrl}`);
        res.redirect(newUrl);
        return;
    }

    next();
};
