import React, { ReactNode } from 'react';
import T from '../../../../../shared/views/components/T';
import { FilterTable } from '../../../../../shared/dtos/filter-table';
import { Filter } from '../../../../../shared/interfaces/filter';
import { SelectedFilterList } from './SelectedFilterList';
import { flattenReferences } from '../../../../../shared/utils/flatten-references';

interface SummaryTableRowProps {
  filter: FilterTable;
  selectedFilterOptions: Filter[];
  idx: number;
  landing?: boolean;
  columns?: string;
  rows?: string;
}

export function SummaryTableRow(props: SummaryTableRowProps): ReactNode {
  const { filter, selectedFilterOptions, idx, landing } = props;
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

  const selectedFilterList = <SelectedFilterList {...{ filter, flatFilters, selectedFilterOptions, idx }} />;
  let visibility = (
    <span className="govuk-tag govuk-tag--green">
      <T>summary.visibility.shown</T>
    </span>
  );
  if (landing) {
    visibility = (
      <span className="govuk-tag govuk-tag--yellow">
        <T>summary.visibility.hidden</T>
      </span>
    );
  } else if (props.rows && props.rows === filter.factTableColumn) {
    visibility = (
      <span className="govuk-tag govuk-tag--blue">
        <T>summary.visibility.rows</T>
      </span>
    );
  } else if (props.columns && props.columns === filter.factTableColumn) {
    visibility = (
      <span className="govuk-tag govuk-tag--blue">
        <T>summary.visibility.columns</T>
      </span>
    );
  } else if (props.rows && props.columns) {
    visibility = (
      <span className="govuk-tag govuk-tag--yellow">
        <T>summary.visibility.hidden</T>
      </span>
    );
  }

  return (
    <tr key={`row-${idx}}`} className="govuk-table__row">
      <td className="govuk-table__cell">{filter.columnName}</td>
      <td className="govuk-table__cell">{visibility}</td>
      <td className="govuk-table__cell">{selectedFilterList}</td>
      <td className="govuk-table__cell">{changeLink}</td>
    </tr>
  );
}
