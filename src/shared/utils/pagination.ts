export function paginationSequence(currentPage: number, totalPages: number): (string | number)[] {
  if (totalPages <= 1) {
    return [];
  }

  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();

  // Always include first, current, and last pages
  pages.add(1);
  pages.add(currentPage);
  pages.add(totalPages);

  // Include adjacent pages to current page
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  // Convert to sorted array
  const sortedPages = Array.from(pages).sort((a, b) => a - b);

  // Build result with ellipses
  const sequence: (string | number)[] = [];

  for (let i = 0; i < sortedPages.length; i++) {
    const currentPageNum = sortedPages[i];
    const nextPageNum = sortedPages[i + 1];

    sequence.push(currentPageNum);

    // Add ellipsis if there's a gap of more than 1
    if (nextPageNum && nextPageNum - currentPageNum > 2) {
      sequence.push('...');
    } else if (nextPageNum && nextPageNum - currentPageNum === 2) {
      // If gap is exactly 1 page, show that page instead of ellipsis
      sequence.push(currentPageNum + 1);
    }
  }

  return sequence;
}

export const pageInfo = (currentPage: number, pageSize: number, totalRows: number) => {
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    current_page: currentPage,
    total_pages: totalPages,
    page_size: pageSize,
    page_info: {
      total_records: totalRows,
      start_record: (currentPage - 1) * pageSize + 1,
      end_record: Math.min(currentPage * pageSize, totalRows)
    },
    pagination: totalPages > 1 ? paginationSequence(currentPage, totalPages) : []
  };
};
