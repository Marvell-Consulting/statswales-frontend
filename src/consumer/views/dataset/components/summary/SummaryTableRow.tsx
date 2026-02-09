import React, { ReactNode } from 'react';
import T from '../../../../../shared/views/components/T';
import { FilterTable, FilterValues } from '../../../../../shared/dtos/filter-table';
import { Filter } from '../../../../../shared/interfaces/filter';
import { SelectedFilterList } from './SelectedFilterList';

interface SummaryTableRowProps {
  filter: FilterTable;
  selectedFilterOptions: Filter[];
  idx: number;
}

function flattenReferences(nodes: FilterValues[]): FilterValues[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenReferences(node.children) : [])]);
}

export function SummaryTableRow(props: SummaryTableRowProps): ReactNode {
  const { filter, selectedFilterOptions, idx } = props;
  const flatFilters = flattenReferences(filter.values);
  let changeLink = (
    <a key={`c-${idx}`} href={`#filter-${filter.factTableColumn}`}>
      <T>summary.actions.change</T>
    </a>
  );
  if (flatFilters.length === 1) {
    changeLink = (
      <span key={`c-${idx}`}>
        <T>summary.actions.no_action</T>
      </span>
    );
  }

  return (
    <tr key={`row-${idx}}`} className="govuk-table__row">
      <td className="govuk-table__cell">{filter.columnName}</td>
      <td className="govuk-table__cell">
        <span className="govuk-tag govuk-tag--green">
          <T>summary.visibility.shown</T>
        </span>
      </td>
      <td className="govuk-table__cell">
        <SelectedFilterList {...{ filter, flatFilters, selectedFilterOptions, idx }} />
      </td>
      <td className="govuk-table__cell">{changeLink}</td>
    </tr>
  );
}
