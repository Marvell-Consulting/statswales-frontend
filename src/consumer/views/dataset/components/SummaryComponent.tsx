import React from 'react';
import { FilterTable, FilterValues } from '../../../../shared/dtos/filter-table';
import { Filter } from '../../../../shared/interfaces/filter';

interface SummaryDataProps {
  filters: FilterTable[];
  selectedFilterOptions: Filter[];
}

function flattenReferences(nodes: FilterValues[]): FilterValues[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenReferences(node.children) : [])]);
}

export function SummaryComponent(props: SummaryDataProps) {
  const tableRows = props.filters.map((filter, fidx) => {
    const flatFilters = flattenReferences(filter.values);
    let selectedValues = [
      <span key={`s-${fidx}`} className="govuk-tag govuk-tag--grey">
        All {flatFilters.length} values
      </span>
    ];
    const selectedFilter = props.selectedFilterOptions.find((opt) => filter.factTableColumn === opt.columnName);
    if (selectedFilter && flatFilters.length > 1) {
      selectedValues = selectedFilter.values.map((val, oidx) => {
        const valName = filter.values.find((ref) => ref.reference === val)?.description || 'Unknown';
        return (
          <React.Fragment key={`s-${fidx}-${oidx}`}>
            <span className="govuk-tag govuk-tag--grey">{valName}</span>{' '}
          </React.Fragment>
        );
      });
    } else if (flatFilters.length === 1) {
      selectedValues = [
        <span key={`s-${fidx}`} className="govuk-tag govuk-tag--grey">
          {flatFilters[0].description}
        </span>
      ];
    }
    let changeLink = (
      <a key={`c-${fidx}`} href={`#filter-${filter.factTableColumn}`}>
        Change values
      </a>
    );
    if (flatFilters.length === 1) {
      changeLink = <span key={`c-${fidx}`}>Values can&#39;t be changed</span>;
    }

    return (
      <tr key={`row-${fidx}}`} className="govuk-table__row">
        <td className="govuk-table__cell">{filter.columnName}</td>
        <td className="govuk-table__cell">
          <span className="govuk-tag govuk-tag--grey">Visible</span>
        </td>
        <td className="govuk-table__cell">{selectedValues}</td>
        <td className="govuk-table__cell">{changeLink}</td>
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
          <tbody className="govuk-table__body">{tableRows}</tbody>
        </table>
      </div>
    </details>
  );
}
