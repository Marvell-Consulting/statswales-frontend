import clsx from 'clsx';
import React from 'react';

export default function Pagination({
  t,
  total_pages,
  current_page,
  page_size,
  pagination,
  hideLineCount,
  hide_pagination_hint,
  i18n,
  anchor,
  page_info,
  buildUrl,
  url
}) {
  if (total_pages <= 1) {
    return null;
  }
  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <nav className="govuk-pagination" aria-label="Pagination">
            <div className={clsx('govuk-pagination__prev', { 'govuk-pagination__inactive': current_page === 1 })}>
              {current_page === 1 ? (
                <span className="govuk-pagination__link-title">{t('pagination.previous')}</span>
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
                  <span className="govuk-pagination__link-title">{t('pagination.previous')}</span>
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
                  <span className="govuk-pagination__link-title">{t('pagination.next')}</span>
                </a>
              ) : (
                <span className="govuk-pagination__link-title">{t('pagination.next')}</span>
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
              {t('publish.preview.showing_rows', {
                start: page_info.start_record,
                end: page_info.end_record,
                total: page_info.total_records
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
