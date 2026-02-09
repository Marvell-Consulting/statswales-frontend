import React, { ReactNode } from 'react';
import T from '../../../../shared/views/components/T';
import { FilterTable } from '../../../../shared/dtos/filter-table';
import { Filter } from '../../../../shared/interfaces/filter';
import { SummaryTableRow } from './summary/SummaryTableRow';
import { isFeatureEnabled } from '../../../../shared/utils/feature-flags';
import { FeatureFlag } from '../../../../shared/enums/feature-flag';
import { useLocals } from '../../../../shared/views/context/Locals';

interface SummaryDataProps {
  filters: FilterTable[];
  selectedFilterOptions: Filter[];
}

export function SummaryTable(props: SummaryDataProps): ReactNode {
  const { protocol, hostname, url } = useLocals();
  const urlObj = new URL(url, `${protocol}://${hostname}`);

  if (!isFeatureEnabled(urlObj.searchParams, FeatureFlag.SummaryTable)) {
    return null;
  }

  return (
    <details className="govuk-details" open={true}>
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          <T>summary.title</T>
        </span>
      </summary>
      <div className="govuk-details__text ">
        <table className="govuk-table sticky-table">
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
