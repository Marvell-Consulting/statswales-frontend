import path from 'node:path';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';

import { NextFunction, Request, Response, Router } from 'express';
import { t } from 'i18next';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

import { NotFoundException } from '../exceptions/not-found.exception';
import { createToc, docRenderer } from '../services/marked';
import { logger } from '../utils/logger';

const docsPath = path.join(__dirname, '..', '..', '..', 'docs', 'static-pages');

export const staticPages = Router();

staticPages.get('/accessibility', async (req: Request, res: Response, next: NextFunction) => {
  const lang = req.language.split('-')[0]?.toLowerCase() || 'en';
  const requestedFilePath = path.join(docsPath, `accessibility.${lang}.md`);
  const normalizedFilePath = path.resolve(requestedFilePath);

  if (!normalizedFilePath.startsWith(docsPath) && !fs.existsSync(normalizedFilePath)) {
    next(new NotFoundException('missing accessibility docs'));
    return;
  }

  try {
    const title = t('accessibility.title', { lng: req.language });
    const markdownFile: string = await readFile(normalizedFilePath, 'utf8');
    const { window } = new JSDOM(`<!DOCTYPE html>`);
    const domPurify = DOMPurify(window);
    const tableOfContents = createToc(markdownFile);
    marked.use({ renderer: docRenderer });
    const content = domPurify.sanitize(await marked.parse(markdownFile));
    res.render('static-page', { content, tableOfContents, title });
  } catch (err) {
    logger.error(err, 'Could not render accessibility page');
    next(new NotFoundException());
  }
});
