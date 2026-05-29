import { clsx } from 'clsx';
import React from 'react';
import T from './T';
import { useLocals } from '../context/Locals';
import { PageInfo } from '../../dtos/view-dto';
import { PAGE_NUMBER_CAP } from '../../utils/pagination';
import qs from 'qs';

export type PaginationProps = {
  pagination: (number | string)[];
  total_pages: number;
  // null in cursor mode — the backend doesn't surface a page index when
  // paginating by keyset.
  current_page: number | null;
  page_size: number;
  hide_pagination_hint?: boolean;
  anchor?: string;
  page_info: PageInfo & { next_cursor?: string | null; prev_cursor?: string | null };
};

export default function Pagination({
  total_pages,
  current_page,
  page_size,
  pagination,
  hide_pagination_hint,
  anchor,
  page_info
}: PaginationProps) {
  const { buildUrl, url, i18n } = useLocals();

  const inCursorMode = current_page == null;
  const nextCursor = page_info.next_cursor ?? null;
  const prevCursor = page_info.prev_cursor ?? null;

  if (total_pages <= 1 && !inCursorMode) {
    return null;
  }

  const [baseUrl, query] = url.split('?');
  // Strip page_number / cursor so we can re-emit the right one per link
  // rather than carrying a stale value forward.
  const parsedQuery = { ...qs.parse(query) };
  delete (parsedQuery as Record<string, unknown>).page_number;
  delete (parsedQuery as Record<string, unknown>).cursor;

  const showPrevLink = inCursorMode ? prevCursor != null : current_page! > 1;
  const showNextLink = inCursorMode
    ? nextCursor != null
    : current_page! < total_pages &&
      // At the cap boundary the next link switches to a cursor — only emit a
      // page_number-based link while we're inside the capped range.
      (current_page! < PAGE_NUMBER_CAP || nextCursor != null);

  const prevHref = inCursorMode
    ? buildUrl(baseUrl, i18n.language, { ...parsedQuery, cursor: prevCursor!, page_size }, anchor)
    : buildUrl(baseUrl, i18n.language, { ...parsedQuery, page_number: current_page! - 1, page_size }, anchor);

  const nextHref =
    inCursorMode || current_page! >= PAGE_NUMBER_CAP
      ? buildUrl(baseUrl, i18n.language, { ...parsedQuery, cursor: nextCursor!, page_size }, anchor)
      : buildUrl(baseUrl, i18n.language, { ...parsedQuery, page_number: current_page! + 1, page_size }, anchor);

  // Numbered jumps are only meaningful in offset mode. In cursor mode we
  // render Prev/Next links and a coarser summary.
  const numberedLinks = inCursorMode ? [] : pagination;

  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="total-rows">
            {!hide_pagination_hint && !inCursorMode && (
              <div>
                <T
                  start={page_info.start_record?.toLocaleString()}
                  end={page_info.end_record?.toLocaleString()}
                  total={page_info.total_records?.toLocaleString()}
                >
                  publish.preview.showing_rows
                </T>
              </div>
            )}
          </div>
        </div>
        <div className="govuk-grid-column-two-thirds">
          <nav className="govuk-pagination" aria-label="Pagination">
            {showPrevLink && (
              <div className={clsx('govuk-pagination__prev')}>
                <a className="govuk-link govuk-pagination__link" href={prevHref} rel="prev">
                  <span className="govuk-pagination__link-title">
                    <T>pagination.previous</T>
                  </span>
                </a>
              </div>
            )}
            <ul className="govuk-pagination__list">
              {numberedLinks.map((page, index) => {
                if (page === '...') {
                  return (
                    <li key={index} className="govuk-pagination__item govuk-pagination__item--ellipses">
                      ⋯
                    </li>
                  );
                }
                if (page === current_page) {
                  return (
                    <li
                      key={index}
                      className="govuk-pagination__item govuk-pagination__item--current govuk-pagination__inactive"
                    >
                      <span aria-current="page">{page}</span>
                    </li>
                  );
                }
                return (
                  <li key={index} className="govuk-pagination__item">
                    <a
                      className="govuk-link govuk-pagination__link"
                      href={buildUrl(
                        baseUrl,
                        i18n.language,
                        { ...parsedQuery, page_number: page, page_size: page_size },
                        anchor
                      )}
                      aria-label={`Page ${page}`}
                    >
                      {page}
                    </a>
                  </li>
                );
              })}
            </ul>

            {showNextLink && (
              <div className={clsx('govuk-pagination__next')}>
                <a className="govuk-link govuk-pagination__link" href={nextHref} rel="next">
                  <span className="govuk-pagination__link-title">
                    <T>pagination.next</T>
                  </span>
                </a>
              </div>
            )}
          </nav>
        </div>
      </div>

      <div className="govuk-pagination__summary">
        {inCursorMode ? (
          <>
            Page &gt; {PAGE_NUMBER_CAP} of {total_pages}
          </>
        ) : (
          <>
            Page {current_page} of {total_pages}
          </>
        )}
      </div>
    </>
  );
}
