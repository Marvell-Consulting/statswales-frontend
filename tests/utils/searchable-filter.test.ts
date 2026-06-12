import { FilterTable, FilterValues } from '../../src/shared/dtos/filter-table';
import {
  SEARCHABLE_FILTER_THRESHOLD,
  NO_JS_FILTER_CAP,
  isSearchableFilter,
  cappedFilterValues,
  toSearchOptions
} from '../../src/shared/views/components/filters/searchable-filter';

const flatValues = (count: number): FilterValues[] =>
  Array.from({ length: count }, (_, i) => ({ reference: `ref-${i}`, description: `Value ${i}` }));

const filter = (values: FilterValues[]): FilterTable => ({
  columnName: 'Drug',
  factTableColumn: 'drug',
  values
});

describe('isSearchableFilter', () => {
  test('is false for a small flat list', () => {
    expect(isSearchableFilter(filter(flatValues(10)))).toBe(false);
  });

  test('is false at exactly the threshold', () => {
    expect(isSearchableFilter(filter(flatValues(SEARCHABLE_FILTER_THRESHOLD)))).toBe(false);
  });

  test('is true above the threshold', () => {
    expect(isSearchableFilter(filter(flatValues(SEARCHABLE_FILTER_THRESHOLD + 1)))).toBe(true);
  });

  test('respects a custom threshold', () => {
    expect(isSearchableFilter(filter(flatValues(50)), 25)).toBe(true);
    expect(isSearchableFilter(filter(flatValues(50)), 100)).toBe(false);
  });

  test('is false for a hierarchical list even when large', () => {
    const values: FilterValues[] = [
      { reference: 'parent', description: 'Parent', children: flatValues(SEARCHABLE_FILTER_THRESHOLD + 1) }
    ];
    expect(isSearchableFilter(filter(values))).toBe(false);
  });
});

describe('cappedFilterValues', () => {
  test('returns everything when under the cap', () => {
    const values = flatValues(10);
    expect(cappedFilterValues(values, [], 200)).toHaveLength(10);
  });

  test('caps to the limit when over', () => {
    expect(cappedFilterValues(flatValues(5000), [], NO_JS_FILTER_CAP)).toHaveLength(NO_JS_FILTER_CAP);
  });

  test('puts selected values first so an active selection is always shown', () => {
    const values = flatValues(5000);
    const selected = ['ref-4000', 'ref-4500'];
    const capped = cappedFilterValues(values, selected, 200);
    expect(capped).toHaveLength(200);
    expect(capped.slice(0, 2).map((v) => v.reference)).toEqual(selected);
  });

  test('does not exceed the cap even with many selected values', () => {
    const values = flatValues(5000);
    const selected = values.slice(0, 300).map((v) => v.reference);
    const capped = cappedFilterValues(values, selected, 200);
    expect(capped).toHaveLength(200);
  });
});

describe('toSearchOptions', () => {
  test('encodes the reference to match a submitted checkbox value', () => {
    const values: FilterValues[] = [{ reference: '2018/19', description: 'April 2018 to March 2019' }];
    expect(toSearchOptions(values)).toEqual([['April 2018 to March 2019', '2018%2F19']]);
  });

  test('marks zero-count values as disabled with a trailing 1', () => {
    const values: FilterValues[] = [
      { reference: 'a', description: 'A', count: '5' },
      { reference: 'b', description: 'B', count: '0' }
    ];
    expect(toSearchOptions(values)).toEqual([
      ['A', 'a'],
      ['B', 'b', 1]
    ]);
  });
});
