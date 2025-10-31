import { clsx } from 'clsx';
import React from 'react';
import T from './T';
import { useLocals } from '../context/Locals';
import { PageInfo } from '../../dtos/view-dto';
import qs from 'qs';

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
  const [baseUrl, query] = url.split('?');
  const parsedQuery = qs.parse(query);
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
            {current_page > 1 && (
              <div className={clsx('govuk-pagination__prev')}>
                <a
                  className="govuk-link govuk-pagination__link"
                  href={buildUrl(
                    baseUrl,
                    i18n.language,
                    { ...parsedQuery, page_number: current_page - 1, page_size },
                    anchor
                  )}
                  rel="prev"
                >
                  <span className="govuk-pagination__link-title">
                    <T>pagination.previous</T>
                  </span>
                </a>
              </div>
            )}
            <ul className="govuk-pagination__list">
              {pagination.map((page, index) => {
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

            {current_page < total_pages && (
              <div className={clsx('govuk-pagination__next')}>
                <a
                  className="govuk-link govuk-pagination__link"
                  href={buildUrl(
                    baseUrl,
                    i18n.language,
                    { ...parsedQuery, page_number: current_page + 1, page_size },
                    anchor
                  )}
                  rel="next"
                >
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
        Page {current_page} of {total_pages}
      </div>
    </>
  );
}
