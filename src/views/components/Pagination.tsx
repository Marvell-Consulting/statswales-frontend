import clsx from 'clsx';
import React from 'react';
import T from './T';
import { useLocals } from '../context/Locals';
import { PageInfo } from '../../dtos/view-dto';

export type PaginationProps = {
  pagination: (number | string)[];
  total_pages: number;
  current_page: number;
  page_size: number;
  hide_pagination_hint?: boolean;
  anchor?: string;
  page_info: PageInfo;
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
  if (total_pages <= 1) {
    return null;
  }
  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="total-rows">
            {!hide_pagination_hint && (
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
            <div className={clsx('govuk-pagination__prev', { 'govuk-pagination__inactive': current_page === 1 })}>
              {current_page === 1 ? (
                <span className="govuk-pagination__link-title">
                  <T>pagination.previous</T>
                </span>
              ) : (
                <a
                  className="govuk-link govuk-pagination__link"
                  href={buildUrl(
                    url.split('?')[0],
                    i18n.language,
                    { page_number: current_page - 1, page_size },
                    anchor
                  )}
                  rel="prev"
                >
                  <span className="govuk-pagination__link-title">
                    <T>pagination.previous</T>
                  </span>
                </a>
              )}
            </div>
            <ul className="govuk-pagination__list">
              {pagination.map((item, index) => {
                if (item === '...') {
                  return (
                    <li key={index} className="govuk-pagination__item govuk-pagination__item--ellipses">
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
                      <a
                        className="govuk-link govuk-pagination__link"
                        href={buildUrl(
                          url.split('?')[0],
                          i18n.language,
                          { page_number: item, page_size: page_size },
                          anchor
                        )}
                        aria-label={`Page ${item}`}
                      >
                        {item}
                      </a>
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
                <a
                  className="govuk-link govuk-pagination__link"
                  href={buildUrl(
                    url.split('?')[0],
                    i18n.language,
                    { page_number: current_page + 1, page_size },
                    anchor
                  )}
                  rel="next"
                >
                  <span className="govuk-pagination__link-title">
                    <T>pagination.next</T>
                  </span>
                </a>
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
    </>
  );
}
