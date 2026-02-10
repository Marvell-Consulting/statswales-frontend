import React from 'react';
import { useLocals } from '../context/Locals';
import T from './T';

export function RowsPerPage({ pageSize }: { pageSize: number }) {
  const { buildUrl, i18n, url } = useLocals();
  const sizeOpts = [5, 10, 25, 50, 100, 250, 500];

  return (
    <form method="GET" action={buildUrl(url, i18n.language)}>
      <div className="govuk-form-group">
        <h4 className="govuk-label-wrapper govuk-!-margin-bottom-1">
          <label className="govuk-label region-subhead" htmlFor="page_size">
            <T>consumer_view.page_size</T>
          </label>
        </h4>
        <select className="govuk-select" id="page_size" name="page_size" defaultValue={pageSize}>
          {sizeOpts.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="govuk-button govuk-button--secondary govuk-button-small govuk-!-margin-left-2"
          data-module="govuk-button"
        >
          <T>consumer_view.apply_page_size</T>
        </button>
      </div>
    </form>
  );
}
