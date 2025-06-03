import { marked, type Tokens } from 'marked';
import fs from 'node:fs';
import path from 'node:path';
import * as readline from 'node:readline';
import { logger } from './logger.server';
import { NotFoundException } from '~/exceptions/not-found.exception';

const baseDocsPath = path.resolve(
  process.env.NODE_ENV === 'production' ? '~/../build/client/docs' : '~/../public/docs'
);

export async function getContents(locale: string, directory: string) {
  const docsPath = path.join(baseDocsPath, directory);
  let fullDocsPath = path.join(docsPath, 'en');

  for (const dir of fs.readdirSync(docsPath)) {
    if (dir === locale.split('-')[0].toLowerCase()) {
      fullDocsPath = path.join(docsPath, dir);
      break;
    }
  }

  const fileList = fs.readdirSync(fullDocsPath);

  return Promise.all(
    fileList.map(async (file) => {
      const title = await getTitle(path.join(fullDocsPath, file));
      const filename = path.parse(file).name;
      return {
        title,
        filename
      };
    })
  );
}

export async function getDoc(filename: string, directory: string, locale: string) {
  const docsPath = path.join(baseDocsPath, directory);
  let fullDocsPath = path.join(docsPath, 'en');
  for (const dir of fs.readdirSync(docsPath)) {
    if (dir === locale.split('-')[0].toLowerCase()) {
      fullDocsPath = path.join(docsPath, dir);
      break;
    }
  }

  const requestedFilePath = path.join(fullDocsPath, `${filename}.md`);
  const normalizedFilePath = path.resolve(requestedFilePath);

  if (!fs.existsSync(normalizedFilePath)) {
    logger.error(`File does not exist in ${directory}: ${filename}`);
    throw new NotFoundException();
  }
  const title = await getTitle(normalizedFilePath);
  const markdownFile: string = fs.readFileSync(normalizedFilePath, 'utf8');
  logger.debug('Generating html from markdown');
  return markdownFile;
}

export async function getTitle(pathToFile: string): Promise<string> {
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

export interface TreeNode {
  text: string;
  depth: number;
  children: TreeNode[];
}

export function createToc(mdText: string) {
  const result: TreeNode[] = [];
  const stack: TreeNode[] = [];

  // Build a tree
  for (const item of marked.lexer(mdText).filter((x) => x.type === 'heading') as Tokens.Heading[]) {
    // Add a children array to the item
    const newItem = { text: item.text, depth: item.depth, children: [] };

    // Pop off the stack until the top of the stack has a smaller depth
    while (stack.length > 0 && newItem.depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }

    // If the stack is empty, place newItem at the top level
    if (stack.length === 0) {
      result.push(newItem);
    } else {
      // Otherwise, the new item becomes a child of the last item in the stack
      const parent = stack[stack.length - 1];
      parent.children.push(newItem);
    }

    // Put this newItem on the stack so future items can become its children
    stack.push(newItem);
  }

  return result;
}
