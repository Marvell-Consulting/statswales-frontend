import { RequestHandler } from 'express';
import { isEmpty, omit } from 'lodash';

import { logger } from '../utils/logger';
import { Locale } from '../enums/locale';

import { ignoreRoutes, SUPPORTED_LOCALES } from './translation';

export const localeUrl = (path: string, locale: Locale, query?: Record<string, string>): string => {
    const locales = SUPPORTED_LOCALES as string[];

    // TODO: translate URL path, params? to Welsh language
    const pathElements = path
        .split('/')
        .filter(Boolean) // strip empty elements to avoid trailing slash
        .filter((element) => !locales.includes(element)); // strip language from the path if present

    const newPath = isEmpty(pathElements) ? '' : `/${pathElements.join('/')}`;
    const queryString = isEmpty(query) ? '' : `?${new URLSearchParams(query).toString()}`;

    return `/${locale}${newPath}${queryString}`;
};

export const languageSwitcher: RequestHandler = (req, res, next): void => {
    const ignoreUrls = new RegExp(`^(${ignoreRoutes.join('|')})`);

    if (ignoreUrls.test(req.originalUrl)) {
        next();
        return;
    }

    const lang = req.language; // language detected by the translation middleware

    // lang switching uses lang=xx query param, once triggered we want to remove it while keeping other query params
    const queryParams = omit(req.query as Record<string, string>, 'lang');

    if ([Locale.English, Locale.EnglishGb].includes(lang as Locale) && !/^\/en-GB/.test(req.originalUrl)) {
        const newUrl = localeUrl(req.path, Locale.EnglishGb, queryParams);
        logger.debug(`Language detected as '${lang}' but not present in path, redirecting to ${newUrl}`);
        res.redirect(newUrl);
        return;
    }

    if ([Locale.Welsh, Locale.WelshGb].includes(lang as Locale) && !/^\/cy-GB/.test(req.originalUrl)) {
        const newUrl = localeUrl(req.path, Locale.WelshGb, queryParams);
        logger.debug(`Language detected as '${lang}' but not present in path, redirecting to ${newUrl}`);
        res.redirect(newUrl);
        return;
    }

    next();
};
