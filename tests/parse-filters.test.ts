import { parseFilters } from '../src/shared/utils/parse-filters';

describe('parseFilters', () => {
  test('should return empty array for undefined input', () => {
    expect(parseFilters(undefined)).toEqual([]);
  });

  test('should handle empty filters', () => {
    const input = {
      area: [],
      industry: {}
    };
    expect(parseFilters(input)).toEqual([]);
  });

  test('should parse single level filters', () => {
    const input = {
      area: ['Value1', 'Value2'],
      industry: 'Value3',
      year: ['2020', '2021']
    };
    const expected = [
      { columnName: 'area', values: ['Value1', 'Value2'] },
      { columnName: 'industry', values: ['Value3'] },
      { columnName: 'year', values: ['2020', '2021'] }
    ];
    expect(parseFilters(input)).toEqual(expected);
  });

  test('should parse nested object filters', () => {
    const input = {
      area: {
        a: 'Value1',
        b: 'Value2'
      },
      industry: {
        a: 'Value3'
      }
    };
    const expected = [
      { columnName: 'area', values: ['Value1', 'Value2'] },
      { columnName: 'industry', values: ['Value3'] }
    ];
    expect(parseFilters(input)).toEqual(expected);
  });

  test('should handle mixed array and object filters', () => {
    const input = {
      area: ['Value1', 'Value2'],
      industry: {
        a: 'Value3',
        b: 'Value4'
      }
    };
    const expected = [
      { columnName: 'area', values: ['Value1', 'Value2'] },
      { columnName: 'industry', values: ['Value3', 'Value4'] }
    ];
    expect(parseFilters(input)).toEqual(expected);
  });

  test('should handle 2nd-level nested values', () => {
    const input = {
      area: {
        a: 'Value1',
        b: 'Value2'
      },
      industry: {
        a: 'Value3',
        b: {
          ba: 'Value4',
          bb: 'Value5'
        }
      }
    };
    const expected = [
      { columnName: 'area', values: ['Value1', 'Value2'] },
      { columnName: 'industry', values: ['Value3', 'Value4', 'Value5'] }
    ];
    expect(parseFilters(input)).toEqual(expected);
  });

  test('should handle 3rd-level nested values', () => {
    const input = {
      area: {
        a: 'Value1',
        b: 'Value2'
      },
      industry: {
        a: 'Value3',
        b: {
          c: 'Value4',
          d: 'Value5',
          e: {
            f: 'Value6'
          }
        }
      }
    };
    const expected = [
      { columnName: 'area', values: ['Value1', 'Value2'] },
      { columnName: 'industry', values: ['Value3', 'Value4', 'Value5', 'Value6'] }
    ];
    expect(parseFilters(input)).toEqual(expected);
  });

  test('should handle nth-level nested values', () => {
    const input = {
      category: {
        a: {
          ab: {
            abc: {
              abcd: {
                abcde: {
                  abcdef: {
                    abcdefg: ['Value1', 'Value2']
                  }
                }
              }
            }
          }
        },
        b: 'Value3'
      }
    };
    const expected = [{ columnName: 'category', values: ['Value1', 'Value2', 'Value3'] }];
    expect(parseFilters(input)).toEqual(expected);
  });
});
