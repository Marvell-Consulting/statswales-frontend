import clsx from 'clsx';
import { LocaleLink } from './LocaleLink';
import T from './T';
import { useLocation } from 'react-router';
import type { PageInfo } from '~/dtos/view-dto';

export type PaginationProps = {
  pagination: (number | string)[];
  total_pages: number;
  current_page: number;
  page_size: number;
  hideLineCount?: boolean;
  hide_pagination_hint?: boolean;
  anchor?: string;
  page_info: PageInfo;
};

export default function Pagination({
  total_pages,
  current_page,
  page_size,
  pagination,
  hideLineCount,
  hide_pagination_hint,
  anchor,
  page_info
}: PaginationProps) {
  const { pathname } = useLocation();
  if (total_pages <= 1) {
    return null;
  }
  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <nav className="govuk-pagination" aria-label="Pagination">
            <div
              className={clsx('govuk-pagination__prev', {
                'govuk-pagination__inactive': current_page === 1
              })}
            >
              {current_page === 1 ? (
                <span className="govuk-pagination__link-title">
                  <T>pagination.previous</T>
                </span>
              ) : (
                <LocaleLink
                  path={pathname}
                  query={{ page_number: String(current_page - 1), page_size: String(page_size) }}
                  rel="previous"
                  className="govuk-link govuk-pagination__link"
                  preventScrollReset
                >
                  <span className="govuk-pagination__link-title">
                    <T>pagination.previous</T>
                  </span>
                </LocaleLink>
              )}
            </div>
            <ul className="govuk-pagination__list">
              {pagination.map((item, index) => {
                if (item === '...') {
                  return (
                    <li
                      key={index}
                      className="govuk-pagination__item govuk-pagination__item--ellipses"
                    >
                      ⋯
                    </li>
                  );
                } else if (item === current_page) {
                  return (
                    <li
                      key={index}
                      className="govuk-pagination__item govuk-pagination__item--current govuk-pagination__inactive"
                    >
                      <span aria-current="page">{item}</span>
                    </li>
                  );
                } else {
                  return (
                    <li key={index} className="govuk-pagination__item">
                      <LocaleLink
                        path={pathname}
                        query={{ page_number: String(item), page_size: String(page_size) }}
                        aria-label={`Page ${item}`}
                        className="govuk-link govuk-pagination__link"
                        preventScrollReset
                      >
                        {item}
                      </LocaleLink>
                    </li>
                  );
                }
              })}
            </ul>

            <div
              className={clsx('govuk-pagination__next', {
                'govuk-pagination__inactive': current_page >= total_pages
              })}
            >
              {current_page < total_pages ? (
                <LocaleLink
                  path={pathname}
                  rel="next"
                  query={{ page_number: String(current_page + 1), page_size: String(page_size) }}
                  className="govuk-link govuk-pagination__link"
                  preventScrollReset
                >
                  <span className="govuk-pagination__link-title">
                    <T>pagination.next</T>
                  </span>
                </LocaleLink>
              ) : (
                <span className="govuk-pagination__link-title">
                  <T>pagination.next</T>
                </span>
              )}
            </div>
          </nav>
        </div>
      </div>

      <div className="govuk-pagination__summary">
        Page {current_page} of {total_pages}
      </div>

      {!hideLineCount && (
        <div className="govuk-grid-row govuk-!-margin-bottom-2">
          {!hide_pagination_hint && (
            <div className="govuk-grid-column-full govuk-!-text-align-centre govuk-hint">
              <T
                start={page_info.start_record}
                end={page_info.end_record}
                total={page_info.total_records}
              >
                publish.preview.showing_rows
              </T>
            </div>
          )}
        </div>
      )}
    </>
  );
}
