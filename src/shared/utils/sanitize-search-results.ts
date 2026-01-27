import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { SearchResultDTO } from '../dtos/search-result';

export const sanitizeSearchResults = (results: SearchResultDTO[]): SearchResultDTO[] => {
  const { window } = new JSDOM(`<!DOCTYPE html>`);
  const domPurify = DOMPurify(window);

  return results.map((result) => ({
    ...result,
    match_title: result.match_title ? domPurify.sanitize(result.match_title) : undefined,
    match_summary: result.match_summary ? domPurify.sanitize(result.match_summary) : undefined
  }));
};
