import * as Path from 'node:path';
import * as fs from 'node:fs';
import path from 'node:path';
import * as readline from 'node:readline';

import { NextFunction, Request, Response, Router } from 'express';
import { logger } from '../utils/logger';
import { NotFoundException } from '../exceptions/not-found.exception';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { marked, Tokens } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';

export const guidance = Router();
const docsPath = Path.join(__dirname, '..', '..', 'docs', 'guidance');

async function getTitle(pathToFile: string): Promise<string> {
    const readable = fs.createReadStream(pathToFile);
    const reader = readline.createInterface({ input: readable });
    const line: string = await new Promise((resolve) => {
        reader.on('line', (line) => {
            if (line.startsWith('#')) {
                reader.close();
                resolve(line);
            }
        });
    });
    readable.close();
    return line.split('#')[1].trim();
}

function createToc(mdText: string) {
    const { window } = new JSDOM(`<!DOCTYPE html>`);
    const document = window.document;
    const stack = [document.createElement('ul')];
    for (const heading of marked.lexer(mdText).filter((x) => x.type === 'heading') as Tokens.Heading[]) {
        if (heading.depth < stack.length) {
            stack.length = heading.depth;
        } else {
            while (heading.depth > stack.length) {
                const ul = document.createElement('ul');
                stack.at(-1)?.append(ul);
                stack.push(ul);
            }
        }

        const anchor = heading.text.replaceAll('.', '').replaceAll(' ', '-').toLowerCase();
        stack.at(-1)?.insertAdjacentHTML('beforeend', `<li><a href="#guidance-${anchor}">${heading.text}</a></li>`);
    }
    return stack[0].outerHTML;
}

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
    if (fs.existsSync(path.join(fullDocsPath, req.params.file))) {
        logger.error(`File does not exist in guidance: ${req.params.file}`);
        next(new NotFoundException());
    }
    const filePath = path.join(fullDocsPath, `${req.params.file}.md`);
    const title = await getTitle(filePath);
    const mardkwonFile: string = fs.readFileSync(filePath, 'utf8');
    const { window } = new JSDOM(`<!DOCTYPE html>`);
    const domPurify = DOMPurify(window);
    const toc = createToc(mardkwonFile);
    const options = {
        prefix: 'guidance-'
    };

    marked.use(gfmHeadingId(options));
    const content = domPurify.sanitize(await marked.parse(mardkwonFile));
    res.render('guidance', { content, tableOfContents: toc, title });
});
