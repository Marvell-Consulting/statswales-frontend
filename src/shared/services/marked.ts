import * as fs from 'node:fs';
import * as readline from 'node:readline';

import { JSDOM } from 'jsdom';
import { marked, Renderer, RendererObject, Tokens } from 'marked';

export const originalRenderer = new Renderer();

export const docRenderer: RendererObject = {
  paragraph({ tokens }: Tokens.Paragraph): string {
    const text = this.parser.parseInline(tokens);
    return `<p class="govuk-body">${text}</p>`;
  },
  heading({ text, tokens, depth }) {
    const parsedText = this.parser.parseInline(tokens);
    const anchor = text.replaceAll('.', '').replaceAll(' ', '-').toLowerCase();
    switch (depth) {
      case 1:
        return `<h1 id="guidance-${anchor}" class="govuk-heading-xl">${parsedText}</h1>`;
      case 2:
        return `<h2 id="guidance-${anchor}" class="govuk-heading-l">${parsedText}</h2>`;
      case 3:
        return `<h3 id="guidance-${anchor}" class="govuk-heading-m">${parsedText}</h3>`;
      case 4:
        return `<h4 id="guidance-${anchor}" class="govuk-heading-s">${parsedText}</h4>`;
      case 5:
        return `<h5 id="guidance-${anchor}" class="govuk-heading-xs">${parsedText}</h5>`;
      default:
        return `<h${depth} id="guidance-${anchor}"  class="govuk-heading-s">${parsedText}</h${depth + 1}>`;
    }
  },
  list({ items, ordered }: Tokens.List) {
    let text = '';
    for (const item of items) {
      text += originalRenderer.listitem.call(this, item);
    }
    if (ordered) {
      return `<ol class="govuk-list govuk-list--number">${text}</ol>`;
    }
    return `<ul class="govuk-list govuk-list--bullet">${text}</ul>`;
  },
  table({ header, rows }: Tokens.Table) {
    let text = '';
    text += '<thead>';
    for (const cell of header) {
      text += this.tablecell(cell);
    }
    text += '</thead><tbody>';
    for (const row of rows) {
      text += '<tr>';
      for (const cell of row) {
        text += this.tablecell(cell);
      }
      text += '</tr>';
    }
    text += '</tbody>';
    return `<div class="govuk-table__container"><table class="govuk-table">${text}</table></div>`;
  },
  tablecell({ tokens, align, header }: Tokens.TableCell) {
    const text = this.parser.parseInline(tokens);
    let cellAlign = '';
    if (align !== null) {
      cellAlign = ` align="${align}"`;
    }
    let alignClass = '';
    if (align === 'right') {
      alignClass = ' govuk-table__header--numeric';
    }
    if (header) {
      return `<th class="govuk-table__header${alignClass}"${cellAlign}>${text}</th>`;
    }
    return `<td class="govuk-table__cell${alignClass}"${cellAlign}>${text}</td>`;
  },
  link({ tokens, href }) {
    const text = this.parser.parseInline(tokens);
    return `<a class="govuk-link" href="${href}">${text}</a>`;
  }
};

export const metadataRenderer: RendererObject = {
  paragraph({ tokens }: Tokens.Paragraph): string {
    const text = this.parser.parseInline(tokens);
    return `<p class="govuk-body">${text}</p>`;
  },
  heading({ text, tokens, depth }) {
    const parsedText = this.parser.parseInline(tokens);
    const anchor = text.replaceAll('.', '').replaceAll(' ', '-').toLowerCase();
    let hLevel = depth + 2;
    if (hLevel > 6) hLevel = 6;
    switch (depth) {
      case 3:
        return `<h3 id="metadata-${anchor}" class="govuk-heading-m">${parsedText}</h3>`;
      default:
        return `<h${depth} id="metadata-${anchor}"  class="govuk-heading-s">${parsedText}</h${depth + 1}>`;
    }
  },
  list({ items, ordered }: Tokens.List) {
    let text = '';
    for (const item of items) {
      text += originalRenderer.listitem.call(this, item);
    }
    if (ordered) {
      return `<ol class="govuk-list govuk-list--number">${text}</ol>`;
    }
    return `<ul class="govuk-list govuk-list--bullet">${text}</ul>`;
  },
  table({ header, rows }: Tokens.Table) {
    let text = '';
    text += '<thead>';
    for (const cell of header) {
      text += this.tablecell(cell);
    }
    text += '</thead><tbody>';
    for (const row of rows) {
      text += '<tr>';
      for (const cell of row) {
        text += this.tablecell(cell);
      }
      text += '</tr>';
    }
    text += '</tbody>';
    return `<table class="govuk-table">${text}</table>`;
  },
  tablecell({ tokens, align, header }: Tokens.TableCell) {
    const text = this.parser.parseInline(tokens);
    let cellAlign = '';
    if (align !== null) {
      cellAlign = ` align="${align}"`;
    }
    let alignClass = '';
    if (align === 'right') {
      alignClass = ' govuk-table__header--numeric';
    }
    if (header) {
      return `<th class="govuk-table__header${alignClass}"${cellAlign}>${text}</th>`;
    }
    return `<td class="govuk-table__cell${alignClass}"${cellAlign}>${text}</td>`;
  },
  link({ tokens, href }) {
    const text = this.parser.parseInline(tokens);
    return `<a class="govuk-link" href="${href}">${text}</a>`;
  }
};

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

interface TreeNode {
  text: string;
  depth: number;
  children: TreeNode[];
}

function createNestedList(document: Document, treeData: TreeNode[]) {
  const ul = document.createElement('ul');

  ul.className = 'govuk-list govuk-list--bullet govuk-!-margin-bottom-0';

  for (const node of treeData) {
    const li = document.createElement('li');
    const anchor = node.text.replaceAll('.', '').replaceAll(' ', '-').toLowerCase();
    li.innerHTML = `<a class="govuk-link" href="#guidance-${anchor}">${node.text}</a>`;

    if (node.children.length > 0 && node.depth < 3) {
      const childUl = createNestedList(document, node.children);
      li.appendChild(childUl);
    }

    ul.appendChild(li);
  }

  return ul;
}

export function createToc(mdText: string) {
  const result: TreeNode[] = [];
  const stack: TreeNode[] = [];

  // Build a tree
  for (const item of marked.lexer(mdText).filter((x) => x.type === 'heading') as Tokens.Heading[]) {
    // Add a children array to the item
    const newItem = { ...item, children: [] };

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
  const { window } = new JSDOM(`<!DOCTYPE html>`);
  const document = window.document;
  const rootUl = createNestedList(document, result);
  rootUl.className = 'govuk-list';
  return rootUl.outerHTML;
}
