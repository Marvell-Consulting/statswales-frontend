import path from 'node:path';
import fs from 'node:fs';

import { NextFunction, Request, Response, Router } from 'express';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { logger } from '../utils/logger';
import { NotFoundException } from '../exceptions/not-found.exception';
import { docRenderer, createToc, getTitle } from '../services/marked';

export const cookies = Router();
const docsPath = path.join(__dirname, '..', '..', '..', 'docs', 'cookies');

cookies.get('/', async (req: Request, res: Response, next: NextFunction) => {
  logger.debug('Rendering cookie statement page');
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
  res.render('cookies', { content, tableOfContents: toc, title });
});
