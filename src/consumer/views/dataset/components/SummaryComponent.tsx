import React from 'react';
import { FilterTable } from '../../../../shared/dtos/filter-table';
import { Filter } from '../../../../shared/interfaces/filter';

interface SummaryDataProps {
  filters: FilterTable[];
  selectedFilterOptions: Filter[];
}

export function SummaryComponent(props: SummaryDataProps) {
  const tableRows = props.filters.map((filter, fidx) => {
    let selectedValues = [
      <span key={fidx} className="govuk-tag--grey">
        All {filter.values.length} selected
      </span>
    ];
    const selectedFilter = props.selectedFilterOptions.find((opt) => filter.factTableColumn === opt.columnName);
    if (selectedFilter) {
      selectedValues = selectedFilter.values.map((val) => {
        const valName = filter.values.find((ref) => ref.reference === val)?.description || 'Unknown';
        return (
          <span key={fidx} className="govuk-tag--grey">
            {valName}
          </span>
        );
      });
    }
    return (
      <tr key={`row-${fidx}}`} className="govuk-table__row">
        <td>{filter.columnName}</td>
        <td>
          <span className="govuk-tag--grey">Visible</span>
        </td>
        <td>{selectedValues.map((selectedValue) => selectedValue)}</td>
        <td>
          <a href={`#${filter.values.length}`}>Change values</a>
        </td>
      </tr>
    );
  });
  return (
    <details className="govuk-details" open={true}>
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">Summary of variables and selected values</span>
      </summary>
      <div className="govuk-details__text">
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">
                Variable
              </th>
              <th scope="col" className="govuk-table__header">
                Visibility
              </th>
              <th scope="col" className="govuk-table__header">
                Selected values
              </th>
              <th scope="col" className="govuk-table__header">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">{tableRows.map((row) => row)}</tbody>
        </table>
        {/*SelectedFilter Options = <pre>{JSON.stringify(props.selectedFilterOptions, null, 2)}</pre>*/}
        {/*Filters = <pre>{JSON.stringify(props.filters, null, 2)}</pre>*/}
      </div>
    </details>
  );
}
