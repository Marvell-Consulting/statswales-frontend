import path from 'node:path';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';

import express, { NextFunction, Request, Response, Router } from 'express';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { logger } from '../utils/logger';
import { NotFoundException } from '../exceptions/not-found.exception';
import { docRenderer, createToc, getTitle } from '../services/marked';
import { CookiePreferences } from '../interfaces/cookie-preferences';
import { config } from '../config';
import { flashMessages } from '../middleware/flash';
import { RequestHistory } from '../interfaces/request-history';
import { Locale } from '../enums/locale';

export const cookies = Router();

cookies.use(flashMessages);

const bodyParser = express.urlencoded({ extended: true });
const docsPath = path.join(__dirname, '..', '..', '..', 'docs', 'static-pages');

// path-based i18n only ever uses en-GB/cy-GB prefixes (see language-switcher.ts) - only ever redirect back
// into the app under one of those, since the referrer is sourced from stored request history and a crafted
// //evil.com or /\evil.com history entry must never be redirected to
const SUPPORTED_LOCALE_PATH_PREFIXES: string[] = [Locale.EnglishGb, Locale.WelshGb];

const isSupportedLocaleUrl = (url: string): boolean => {
  return SUPPORTED_LOCALE_PATH_PREFIXES.some((locale) => url === `/${locale}` || url.startsWith(`/${locale}/`));
};

const cookiePage = async (req: Request, res: Response, next: NextFunction) => {
  const defaultPref: CookiePreferences = { acceptAll: false, measuring: false, showBanner: true };
  const cookiePreferences = req.cookies['cookiePref'] || defaultPref;
  const referrer = res.locals.history?.find((h: RequestHistory) => h.url !== req.originalUrl)?.url || req.originalUrl;
  const saved = res.locals.flash || false;

  if (req.method === 'POST') {
    logger.debug('Cookie preferences submitted...');
    const { acceptAll, measuring } = req.body;

    if (acceptAll === 'true') {
      cookiePreferences.acceptAll = true;
      cookiePreferences.measuring = true;
      cookiePreferences.showBanner = false;
    } else if (measuring) {
      cookiePreferences.measuring = measuring === 'accept';
      cookiePreferences.acceptAll = false;
      cookiePreferences.showBanner = false;
    }

    res.cookie('cookiePref', cookiePreferences, {
      maxAge: 31536000000, // 1 year
      httpOnly: true,
      sameSite: 'lax',
      secure: config.session.secure
    });

    req.session.flash = [`cookies.settings.saved.heading`];
    req.session.save();
    res.redirect(
      acceptAll === 'true' && isSupportedLocaleUrl(referrer) ? referrer : req.buildUrl('/cookies', req.language)
    );
    return;
  }

  const lang = req.language.split('-')[0]?.toLowerCase() || 'en';
  const requestedFilePath = path.join(docsPath, `cookies.${lang}.md`);
  const normalizedFilePath = path.resolve(requestedFilePath);

  if (!normalizedFilePath.startsWith(docsPath) || !fs.existsSync(normalizedFilePath)) {
    logger.warn(`File does not exist in guidance: ${req.params.file}`);
    next(new NotFoundException());
    return;
  }

  try {
    const title = await getTitle(normalizedFilePath);
    const markdownFile: string = await readFile(normalizedFilePath, 'utf8');
    const { window } = new JSDOM(`<!DOCTYPE html>`);
    const domPurify = DOMPurify(window);
    const toc = createToc(markdownFile);
    marked.use({ renderer: docRenderer });
    const content = domPurify.sanitize(await marked.parse(markdownFile));
    res.render('cookies', { content, tableOfContents: toc, title, cookiePreferences, saved, referrer });
  } catch (err) {
    logger.warn(err, 'Could not render cookies page');
    next(new NotFoundException());
  }
};

const cookieDetailsPage = async (req: Request, res: Response, next: NextFunction) => {
  const lang = req.language.split('-')[0]?.toLowerCase() || 'en';
  const requestedFilePath = path.join(docsPath, `cookie-details.${lang}.md`);
  const normalizedFilePath = path.resolve(requestedFilePath);
  const docsRoot = `${path.resolve(docsPath)}${path.sep}`;

  if (!normalizedFilePath.startsWith(docsRoot) || !fs.existsSync(normalizedFilePath)) {
    logger.warn({ file: path.basename(normalizedFilePath) }, 'Could not load cookie details markdown');
    next(new NotFoundException());
    return;
  }

  try {
    const title = await getTitle(normalizedFilePath);
    const markdownFile: string = await readFile(normalizedFilePath, 'utf8');
    const { window } = new JSDOM(`<!DOCTYPE html>`);
    const domPurify = DOMPurify(window);
    const tableOfContents = createToc(markdownFile);
    marked.use({ renderer: docRenderer });
    const content = domPurify.sanitize(await marked.parse(markdownFile));
    res.render('static-page', { content, tableOfContents, title });
  } catch (err) {
    logger.warn(err, 'Could not render cookie details page');
    next(new NotFoundException());
  }
};

cookies.get('/', bodyParser, cookiePage);
cookies.post('/', bodyParser, cookiePage);
cookies.get('/details', cookieDetailsPage);
