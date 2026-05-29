// Mirror of the backend's SW-1246 page_number cap. Numbered pagination is only
// rendered up to this page; beyond it the UI must drive navigation via the
// `next_cursor` / `prev_cursor` opaque tokens, because keyset queries are far
// cheaper than deep OFFSET reads.
export const PAGE_NUMBER_CAP = 100;

// Same shape as `paginationSequence` but treats `min(totalPages, PAGE_NUMBER_CAP)`
// as the effective last page. The "summary" copy ("Page X of Y") still uses
// the real `total_pages` from the response — only the numbered jump links are
// capped.
export function cappedPaginationSequence(
  currentPage: number,
  totalPages: number,
  cap: number = PAGE_NUMBER_CAP
): (string | number)[] {
  const effective = Math.min(totalPages, cap);
  return paginationSequence(currentPage, effective);
}

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

// Combine the offset-based page_info from `pageInfo()` with the cursor fields
// that come back on the backend view response. The backend's page_info carries
// `next_cursor` / `prev_cursor`; the helper-computed page_info doesn't know
// about cursors. Template render spreads merge in order so this restores the
// cursor fields onto the final object.
export function mergeCursorPageInfo<T extends { next_cursor?: string | null; prev_cursor?: string | null } | undefined>(
  base: object,
  fromView: T
): object {
  return {
    ...base,
    next_cursor: fromView?.next_cursor ?? null,
    prev_cursor: fromView?.prev_cursor ?? null
  };
}

export const pageInfo = (currentPage: number | null | undefined, pageSize: number, totalRows: number) => {
  const totalPages = Math.ceil(totalRows / pageSize);

  // Cursor-mode responses set current_page to null because row offsets aren't
  // meaningful when paginating by keyset. Surface that to the view layer by
  // returning null fields rather than NaN — the Pagination component renders
  // the cursor-only "Next / Previous" variant in that case.
  if (currentPage == null) {
    return {
      current_page: null,
      total_pages: totalPages,
      page_size: pageSize,
      page_info: {
        total_records: totalRows,
        start_record: null,
        end_record: null
      },
      pagination: [] as (string | number)[]
    };
  }

  return {
    current_page: currentPage,
    total_pages: totalPages,
    page_size: pageSize,
    page_info: {
      total_records: totalRows,
      start_record: (currentPage - 1) * pageSize + 1,
      end_record: Math.min(currentPage * pageSize, totalRows)
    },
    pagination: totalPages > 1 ? cappedPaginationSequence(currentPage, totalPages) : []
  };
};
