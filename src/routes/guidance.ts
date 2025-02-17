import * as fs from 'node:fs';
import path from 'node:path';

import { NextFunction, Request, Response, Router } from 'express';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { createToc, docRenderer, getTitle } from '../services/marked';
import { NotFoundException } from '../exceptions/not-found.exception';
import { logger } from '../utils/logger';

export const guidance = Router();
const docsPath = path.join(__dirname, '..', '..', 'docs', 'guidance');

guidance.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const documentList: string[] = [];
    let fullDocsPath = path.join(docsPath, 'en');
    for (const dir of fs.readdirSync(docsPath)) {
        if (dir === req.language.split('-')[0].toLowerCase()) {
            fullDocsPath = path.join(docsPath, dir);
            break;
        }
    }
    const fileList = fs.readdirSync(fullDocsPath);
    for (const file of fileList) {
        const title = await getTitle(path.join(fullDocsPath, file));
        documentList.push(`<li><a href="/${req.language}/guidance/${path.parse(file).name}">${title}</a></li>`);
    }
    const heading = '<h1 class="govuk-heading-l">Guidance</h1>';
    const guidanceList = `<ul class="govuk-list govuk-list--bullet">${documentList.join('\n')}</ul>`;
    const content = `${heading}${guidanceList}`;
    res.render('guidance', { content, tableOfContents: '', title: 'Guidance' });
});

guidance.get('/:file', async (req: Request, res: Response, next: NextFunction) => {
    let fullDocsPath = path.join(docsPath, 'en');
    for (const dir of fs.readdirSync(docsPath)) {
        if (dir === req.language.split('-')[0].toLowerCase()) {
            fullDocsPath = path.join(docsPath, dir);
            break;
        }
    }
    const requestedFilePath = path.join(fullDocsPath, `${req.params.file}.md`);
    const normalizedFilePath = path.resolve(requestedFilePath);
    if (!normalizedFilePath.startsWith(fullDocsPath) || !fs.existsSync(normalizedFilePath)) {
        logger.error(`File does not exist in guidance: ${req.params.file}`);
        next(new NotFoundException());
        return;
    }
    const title = await getTitle(normalizedFilePath);
    const markdownFile: string = fs.readFileSync(normalizedFilePath, 'utf8');
    const { window } = new JSDOM(`<!DOCTYPE html>`);
    const domPurify = DOMPurify(window);
    logger.debug('Generating html from markdown');
    marked.use({ renderer: docRenderer });
    const tableOfContents = createToc(markdownFile);
    const content = domPurify.sanitize(await marked.parse(markdownFile));
    res.render('guidance', { content, tableOfContents, title });
});
