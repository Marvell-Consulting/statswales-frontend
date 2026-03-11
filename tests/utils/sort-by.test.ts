import { parseSortBy, serializeSortBy, SortByInterface } from '../../src/shared/interfaces/sort-by';

describe('serializeSortBy', () => {
  it('should serialize with direction', () => {
    expect(serializeSortBy({ columnName: 'title', direction: 'ASC' })).toBe('title:asc');
    expect(serializeSortBy({ columnName: 'age', direction: 'DESC' })).toBe('age:desc');
  });

  it('should default direction to asc when undefined', () => {
    expect(serializeSortBy({ columnName: 'title' })).toBe('title:asc');
  });
});

describe('parseSortBy', () => {
  it('should return undefined for undefined', () => {
    expect(parseSortBy(undefined)).toBeUndefined();
  });

  it('should return undefined for null', () => {
    expect(parseSortBy(null)).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(parseSortBy('')).toBeUndefined();
  });

  it('should parse colon-format string', () => {
    expect(parseSortBy('title:asc')).toEqual({ columnName: 'title', direction: 'ASC' });
    expect(parseSortBy('age:DESC')).toEqual({ columnName: 'age', direction: 'DESC' });
  });

  it('should default direction to ASC when omitted', () => {
    expect(parseSortBy('title')).toEqual({ columnName: 'title', direction: 'ASC' });
  });

  it('should parse object format (backwards compat with qs bracket notation)', () => {
    const obj = { columnName: 'title', direction: 'ASC' };
    expect(parseSortBy(obj)).toEqual({ columnName: 'title', direction: 'ASC' });
  });

  it('should round-trip through serialize and parse', () => {
    const original: SortByInterface = { columnName: 'title', direction: 'DESC' };
    const serialized = serializeSortBy(original);
    const parsed = parseSortBy(serialized);
    expect(parsed).toEqual(original);
  });
});
