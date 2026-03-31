import React, { ReactNode } from 'react';
import T from '../../../../shared/views/components/T';
import { FilterTable } from '../../../../shared/dtos/filter-table';
import { Filter } from '../../../../shared/interfaces/filter';
import { SummaryTableRow } from './summary/SummaryTableRow';

interface SummaryDataProps {
  filters: FilterTable[];
  selectedFilterOptions: Filter[];
  columns?: string;
  rows?: string;
  landing?: boolean;
  showAccordion?: boolean;
}

function SummaryContent(props: SummaryDataProps): ReactNode {
  return (
    <table className="govuk-table sticky-table summary-table">
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
            {...{
              filter: filter,
              selectedFilterOptions: props.selectedFilterOptions,
              idx: idx,
              columns: props.columns,
              rows: props.rows,
              landing: props.landing
            }}
          />
        ))}
      </tbody>
    </table>
  );
}

export function SummaryTable(props: SummaryDataProps): ReactNode {
  if (!props.showAccordion) {
    return SummaryContent(props);
  }

  return (
    <details className="govuk-details summary-accordion" data-module="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          <T>summary.title</T>
        </span>
      </summary>
      <div className="govuk-details__text">{SummaryContent(props)}</div>
    </details>
  );
}
