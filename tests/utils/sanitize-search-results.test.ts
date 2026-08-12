import { sanitizeSearchResults } from '../../src/shared/utils/sanitize-search-results';
import { SearchResultDTO } from '../../src/shared/dtos/search-result';

const baseResult: SearchResultDTO = {
  id: '1',
  title: 'Original title'
};

describe('sanitizeSearchResults', () => {
  it('preserves legitimate highlighting markup', () => {
    const results: SearchResultDTO[] = [
      {
        ...baseResult,
        match_title: 'A <mark>matching</mark> title',
        match_summary: 'A <mark>matching</mark> summary'
      }
    ];

    const [sanitized] = sanitizeSearchResults(results);

    expect(sanitized.match_title).toBe('A <mark>matching</mark> title');
    expect(sanitized.match_summary).toBe('A <mark>matching</mark> summary');
  });

  it('strips <script> tags from match_title and match_summary', () => {
    const results: SearchResultDTO[] = [
      {
        ...baseResult,
        match_title: '<script>alert(1)</script>Hello',
        match_summary: '<script>alert(1)</script>World'
      }
    ];

    const [sanitized] = sanitizeSearchResults(results);

    expect(sanitized.match_title).not.toContain('<script');
    expect(sanitized.match_summary).not.toContain('<script');
    expect(sanitized.match_title).toContain('Hello');
    expect(sanitized.match_summary).toContain('World');
  });

  it('strips inline event handler attributes', () => {
    const results: SearchResultDTO[] = [
      {
        ...baseResult,
        match_title: '<img src="x" onerror="alert(1)">'
      }
    ];

    const [sanitized] = sanitizeSearchResults(results);

    expect(sanitized.match_title).not.toContain('onerror');
  });

  it('leaves undefined match fields untouched', () => {
    const results: SearchResultDTO[] = [{ ...baseResult }];

    const [sanitized] = sanitizeSearchResults(results);

    expect(sanitized.match_title).toBeUndefined();
    expect(sanitized.match_summary).toBeUndefined();
  });
});
