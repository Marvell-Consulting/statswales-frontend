import { pageInfo, paginationSequence } from '../src/shared/utils/pagination';

// input params are [currentPage, totalPages]
// expected output is an array of page numbers as strings, with skipped pages represented by '...'
// for single page, no pagination at all
// otherwise, current, first and last pages are always shown
// adjacent pages (previous and next) are shown if they exist
// ellipses are used to represent more than one skipped page
// if only one page is skipped, show that page instead of an ellipsis

const testCases = [
  { input: [1, 1], expected: [] },
  { input: [1, 2], expected: [1, 2] },
  { input: [1, 3], expected: [1, 2, 3] },
  { input: [2, 3], expected: [1, 2, 3] },
  { input: [3, 3], expected: [1, 2, 3] },
  { input: [1, 4], expected: [1, 2, 3, 4] },
  { input: [2, 4], expected: [1, 2, 3, 4] },
  { input: [3, 4], expected: [1, 2, 3, 4] },
  { input: [4, 4], expected: [1, 2, 3, 4] },
  { input: [1, 5], expected: [1, 2, '...', 5] },
  { input: [4, 5], expected: [1, 2, 3, 4, 5] },
  { input: [1, 10], expected: [1, 2, '...', 10] },
  { input: [2, 10], expected: [1, 2, 3, '...', 10] },
  { input: [3, 10], expected: [1, 2, 3, 4, '...', 10] },
  { input: [4, 10], expected: [1, 2, 3, 4, 5, '...', 10] },
  { input: [5, 10], expected: [1, '...', 4, 5, 6, '...', 10] },
  { input: [1, 100], expected: [1, 2, '...', 100] },
  { input: [3, 100], expected: [1, 2, 3, 4, '...', 100] },
  { input: [15, 100], expected: [1, '...', 14, 15, 16, '...', 100] },
  { input: [99, 100], expected: [1, '...', 98, 99, 100] },
  { input: [100, 100], expected: [1, '...', 99, 100] }
];

describe('paginationSequence', () => {
  testCases.forEach(({ input, expected }) => {
    test(`input: ${input} => expected: ${expected}`, () => {
      const result = paginationSequence(input[0], input[1]);
      expect(result).toEqual(expected);
    });
  });
});

describe('pageInfo', () => {
  test('should return correct pagination info', () => {
    const result = pageInfo(2, 10, 35);
    expect(result).toEqual({
      current_page: 2,
      total_pages: 4,
      page_size: 10,
      page_info: {
        total_records: 35,
        start_record: 11,
        end_record: 20
      },
      pagination: [1, 2, 3, 4]
    });
  });

  test('should handle edge case of zero total rows', () => {
    const result = pageInfo(1, 10, 0);
    expect(result).toEqual({
      current_page: 1,
      total_pages: 0,
      page_size: 10,
      page_info: {
        total_records: 0,
        start_record: 1,
        end_record: 0
      },
      pagination: []
    });
  });
});
