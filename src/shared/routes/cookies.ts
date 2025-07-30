import path from 'node:path';
import fs from 'node:fs';

import express, { NextFunction, Request, Response, Router } from 'express';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { logger } from '../utils/logger';
import { NotFoundException } from '../exceptions/not-found.exception';
import { docRenderer, createToc, getTitle } from '../services/marked';
import { CookiePreferences } from '../interfaces/cookie-preferences';

export const cookies = Router();

const bodyParser = express.urlencoded({ extended: true });
const docsPath = path.join(__dirname, '..', '..', '..', 'docs', 'cookies');

const cookiePage = async (req: Request, res: Response, next: NextFunction) => {
  const defaultPref: CookiePreferences = { acceptAll: false, measuring: false, showBanner: true };
  const cookiePreferences = req.cookies['cookiePref'] || defaultPref;

  if (req.method === 'POST') {
    logger.debug('Cookie preferences submitted...');
    const { acceptAll, measuring } = req.body;

    if (acceptAll === 'true') {
      cookiePreferences.acceptAll = true;
      cookiePreferences.measuring = true;
      cookiePreferences.showBanner = false;
    } else if (measuring) {
      cookiePreferences.acceptAll = true;
      cookiePreferences.measuring = measuring === 'accept';
      cookiePreferences.showBanner = false;
    }

    res.cookie('cookiePref', cookiePreferences, { maxAge: 31536000000, httpOnly: true });
    res.redirect(req.get('Referrer') || '/');
    return;
  }

  let fullDocsPath = path.join(docsPath, 'en');

  for (const dir of fs.readdirSync(docsPath)) {
    if (dir === req.language.split('-')[0].toLowerCase()) {
      fullDocsPath = path.join(docsPath, dir);
      break;
    }
  }

  const requestedFilePath = path.join(fullDocsPath, 'cookie-statement.md');
  const normalizedFilePath = path.resolve(requestedFilePath);

  if (!normalizedFilePath.startsWith(fullDocsPath) && !fs.existsSync(normalizedFilePath)) {
    logger.error(`File does not exist in guidance: ${req.params.file}`);
    next(new NotFoundException());
    return;
  }

  const title = await getTitle(normalizedFilePath);
  const mardkwonFile: string = fs.readFileSync(normalizedFilePath, 'utf8');
  const { window } = new JSDOM(`<!DOCTYPE html>`);
  const domPurify = DOMPurify(window);
  const toc = createToc(mardkwonFile);
  marked.use({ renderer: docRenderer });
  const content = domPurify.sanitize(await marked.parse(mardkwonFile));

  res.render('cookies', { content, tableOfContents: toc, title, cookiePreferences });
};

cookies.get('/', bodyParser, cookiePage);
cookies.post('/', bodyParser, cookiePage);
