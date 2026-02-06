import React, { ReactNode } from 'react';
import T from '../../../../shared/views/components/T';
import { FilterTable } from '../../../../shared/dtos/filter-table';
import { Filter } from '../../../../shared/interfaces/filter';
import { SummaryTableRow } from './summary/SummaryTableRow';

interface SummaryDataProps {
  filters: FilterTable[];
  selectedFilterOptions: Filter[];
}

export function SummaryTable(props: SummaryDataProps): ReactNode {
  return (
    <details className="govuk-details" open={true}>
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          <T>summary.title</T>
        </span>
      </summary>
      <div className="govuk-details__text">
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">
                <T>summary.headers.variable</T>
              </th>
              <th scope="col" className="govuk-table__header">
                <T>summary.headers.visibility</T>
              </th>
              <th scope="col" className="govuk-table__header">
                <T>summary.headers.values</T>
              </th>
              <th scope="col" className="govuk-table__header">
                <T>summary.headers.action</T>
              </th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {props.filters.map((filter, idx) => (
              <SummaryTableRow
                key={`row-${idx}`}
                {...{ filter: filter, selectedFilterOptions: props.selectedFilterOptions, idx: idx }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
