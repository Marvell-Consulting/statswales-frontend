import { parseFilters, parseFiltersV2, v1FiltersToV2, v2FiltersToV1 } from '../../src/shared/utils/parse-filters';
import { FilterV2 } from '../../src/shared/interfaces/filter';

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

describe('parseFiltersV2', () => {
  test('should return empty array for undefined input', () => {
    expect(parseFiltersV2(undefined)).toEqual([]);
  });

  test('should handle empty filters', () => {
    const input = {
      area: [],
      industry: {}
    };
    expect(parseFiltersV2(input)).toEqual([]);
  });

  test('should parse single filter to V2 format', () => {
    const input = {
      area: ['Value1', 'Value2']
    };
    const expected = [{ area: ['Value1', 'Value2'] }];
    expect(parseFiltersV2(input)).toEqual(expected);
  });

  test('should parse multiple filters to V2 format', () => {
    const input = {
      area: ['Value1', 'Value2'],
      industry: 'Value3',
      year: ['2020', '2021']
    };
    const expected = [{ area: ['Value1', 'Value2'] }, { industry: ['Value3'] }, { year: ['2020', '2021'] }];
    expect(parseFiltersV2(input)).toEqual(expected);
  });

  test('should parse nested object filters to V2 format', () => {
    const input = {
      area: {
        a: 'Value1',
        b: 'Value2'
      },
      industry: {
        a: 'Value3'
      }
    };
    const expected = [{ area: ['Value1', 'Value2'] }, { industry: ['Value3'] }];
    expect(parseFiltersV2(input)).toEqual(expected);
  });

  test('should handle mixed array and object filters in V2 format', () => {
    const input = {
      area: ['Value1', 'Value2'],
      industry: {
        a: 'Value3',
        b: 'Value4'
      }
    };
    const expected = [{ area: ['Value1', 'Value2'] }, { industry: ['Value3', 'Value4'] }];
    expect(parseFiltersV2(input)).toEqual(expected);
  });
});

describe('v2FiltersToV1', () => {
  test('should return empty array for empty input', () => {
    expect(v2FiltersToV1([])).toEqual([]);
  });

  test('should convert single V2 filter to V1 format', () => {
    const input = [{ area: ['Value1', 'Value2'] }];
    const expected = [{ columnName: 'area', values: ['Value1', 'Value2'] }];
    expect(v2FiltersToV1(input)).toEqual(expected);
  });

  test('should convert multiple V2 filters to V1 format', () => {
    const input: FilterV2[] = [{ area: ['Value1', 'Value2'] }, { industry: ['Value3'] }, { year: ['2020', '2021'] }];
    const expected = [
      { columnName: 'area', values: ['Value1', 'Value2'] },
      { columnName: 'industry', values: ['Value3'] },
      { columnName: 'year', values: ['2020', '2021'] }
    ];
    expect(v2FiltersToV1(input)).toEqual(expected);
  });

  test('should handle V2 filter with multiple keys', () => {
    const input = [{ area: ['Value1'], industry: ['Value2', 'Value3'] }];
    const expected = [
      { columnName: 'area', values: ['Value1'] },
      { columnName: 'industry', values: ['Value2', 'Value3'] }
    ];
    expect(v2FiltersToV1(input)).toEqual(expected);
  });

  test('should handle mixed single and multiple key V2 filters', () => {
    const input: FilterV2[] = [{ area: ['Value1'] }, { industry: ['Value2'], year: ['2020'] }];
    const expected = [
      { columnName: 'area', values: ['Value1'] },
      { columnName: 'industry', values: ['Value2'] },
      { columnName: 'year', values: ['2020'] }
    ];
    expect(v2FiltersToV1(input)).toEqual(expected);
  });
});

describe('v1FiltersToV2', () => {
  test('should return empty array for empty input', () => {
    expect(v1FiltersToV2([])).toEqual([]);
  });

  test('should convert single V1 filter to V2 format', () => {
    const input = [{ columnName: 'area', values: ['Value1', 'Value2'] }];
    const expected = [{ area: ['Value1', 'Value2'] }];
    expect(v1FiltersToV2(input)).toEqual(expected);
  });

  test('should convert multiple V1 filters to V2 format', () => {
    const input = [
      { columnName: 'area', values: ['Value1', 'Value2'] },
      { columnName: 'industry', values: ['Value3'] },
      { columnName: 'year', values: ['2020', '2021'] }
    ];
    const expected = [{ area: ['Value1', 'Value2'] }, { industry: ['Value3'] }, { year: ['2020', '2021'] }];
    expect(v1FiltersToV2(input)).toEqual(expected);
  });
});
