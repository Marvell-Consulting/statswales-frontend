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

  it('falls back to defaults when values are zero', () => {
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

  it('clamps negative page_number to 1', () => {
    const result = parsePageOptions(mockReq('/datasets?page_number=-5', { page_number: '-5' }));
    expect(result.pageNumber).toBe(1);
  });

  it('clamps negative page_size to the default', () => {
    const result = parsePageOptions(mockReq('/datasets?page_size=-10', { page_size: '-10' }));
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('caps page_number at the page-number cap to match backend rejection (SW-1246)', () => {
    const result = parsePageOptions(mockReq('/datasets?page_number=500', { page_number: '500' }));
    expect(result.pageNumber).toBe(100);
  });

  it('passes page_number through unchanged when under the cap', () => {
    const result = parsePageOptions(mockReq('/datasets?page_number=42', { page_number: '42' }));
    expect(result.pageNumber).toBe(42);
  });

  it('parses a cursor query parameter', () => {
    const result = parsePageOptions(mockReq('/datasets?cursor=abc.def', { cursor: 'abc.def' }));
    expect(result.cursor).toBe('abc.def');
  });

  it('treats an empty cursor as absent', () => {
    const result = parsePageOptions(mockReq('/datasets?cursor=', { cursor: '' }));
    expect(result.cursor).toBeUndefined();
  });

  it('returns undefined cursor when not supplied', () => {
    const result = parsePageOptions(mockReq('/datasets?page_number=2', { page_number: '2' }));
    expect(result.cursor).toBeUndefined();
  });
});
