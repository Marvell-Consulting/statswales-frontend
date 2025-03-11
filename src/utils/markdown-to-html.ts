import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export const markdownToSafeHTML = async (content: string | undefined) => {
  const { window } = new JSDOM(`<!DOCTYPE html>`);
  const domPurify = DOMPurify(window);

  return domPurify.sanitize(await marked.parse(content ?? ''));
};
