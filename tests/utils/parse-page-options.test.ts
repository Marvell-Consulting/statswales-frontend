import { Request } from 'express';

import { DEFAULT_PAGE_SIZE, parsePageOptions } from '../../src/shared/utils/parse-page-options';

const mockReq = (originalUrl: string, query: Record<string, unknown> = {}): Request =>
  ({ originalUrl, query }) as unknown as Request;

describe('parsePageOptions', () => {
  it('returns defaults when query string is empty', () => {
    const result = parsePageOptions(mockReq('/datasets'));
    expect(result).toEqual({ pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE, sortBy: undefined });
  });

  it('parses explicit page_number and page_size', () => {
    const result = parsePageOptions(
      mockReq('/datasets?page_number=3&page_size=50', { page_number: '3', page_size: '50' })
    );
    expect(result.pageNumber).toBe(3);
    expect(result.pageSize).toBe(50);
  });

  it('truncates decimal values via parseInt', () => {
    const result = parsePageOptions(
      mockReq('/datasets?page_number=2.7&page_size=10.9', { page_number: '2.7', page_size: '10.9' })
    );
    expect(result.pageNumber).toBe(2);
    expect(result.pageSize).toBe(10);
  });

  it('falls back to defaults for non-numeric values', () => {
    const result = parsePageOptions(
      mockReq('/datasets?page_number=abc&page_size=xyz', { page_number: 'abc', page_size: 'xyz' })
    );
    expect(result.pageNumber).toBe(1);
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('falls back to defaults when values are zero (falsy)', () => {
    const result = parsePageOptions(
      mockReq('/datasets?page_number=0&page_size=0', { page_number: '0', page_size: '0' })
    );
    expect(result.pageNumber).toBe(1);
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('parses sort_by from the query string in colon format', () => {
    const result = parsePageOptions(mockReq('/datasets?sort_by=title:asc'));
    expect(result.sortBy).toEqual({ columnName: 'title', direction: 'ASC' });
  });

  it('parses sort_by from qs bracket-object notation', () => {
    const result = parsePageOptions(mockReq('/datasets?sort_by[columnName]=age&sort_by[direction]=DESC'));
    expect(result.sortBy).toEqual({ columnName: 'age', direction: 'DESC' });
  });

  it('returns undefined sortBy when sort_by is absent', () => {
    const result = parsePageOptions(mockReq('/datasets?page_number=2', { page_number: '2' }));
    expect(result.sortBy).toBeUndefined();
  });

  it('handles a URL with no query string', () => {
    // originalUrl.split('?')[1] is undefined here; qs.parse(undefined) should yield {}
    const result = parsePageOptions(mockReq('/datasets'));
    expect(result.sortBy).toBeUndefined();
  });

  // BUG: negative page values pass through because `parseInt('-5', 10) || default`
  // returns the negative number (it's truthy). These get forwarded to the backend
  // API verbatim. Failing on purpose to flag the bug.
  it('clamps negative page_number to 1', () => {
    const result = parsePageOptions(mockReq('/datasets?page_number=-5', { page_number: '-5' }));
    expect(result.pageNumber).toBe(1);
  });

  it('clamps negative page_size to the default', () => {
    const result = parsePageOptions(mockReq('/datasets?page_size=-10', { page_size: '-10' }));
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });
});
