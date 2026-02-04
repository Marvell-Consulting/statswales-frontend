import React from 'react';
import T from '../../../../shared/views/components/T';
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
        <T count={flatFilters.length}>summary.all_values</T>
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
        <T>summary.actions.change</T>
      </a>
    );
    if (flatFilters.length === 1) {
      changeLink = (
        <span key={`c-${fidx}`}>
          <T>summary.actions.no_change</T>
        </span>
      );
    }

    return (
      <tr key={`row-${fidx}}`} className="govuk-table__row">
        <td className="govuk-table__cell">{filter.columnName}</td>
        <td className="govuk-table__cell">
          <span className="govuk-tag govuk-tag--green">
            <T>summary.visibility.shown</T>
          </span>
        </td>
        <td className="govuk-table__cell">{selectedValues}</td>
        <td className="govuk-table__cell">{changeLink}</td>
      </tr>
    );
  });
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
          <tbody className="govuk-table__body">{tableRows}</tbody>
        </table>
      </div>
    </details>
  );
}
