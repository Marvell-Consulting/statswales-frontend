import React, { ReactNode } from 'react';
import T from '../../../../../shared/views/components/T';
import { FilterTable, FilterValues } from '../../../../../shared/dtos/filter-table';
import { Filter } from '../../../../../shared/interfaces/filter';

interface SelectFilterListProps {
  filter: FilterTable;
  flatFilters: FilterValues[];
  selectedFilterOptions: Filter[];
  idx: number;
}

export function SelectedFilterList(props: SelectFilterListProps): ReactNode[] {
  const { filter, flatFilters, selectedFilterOptions, idx } = props;
  let selectedValues = [
    <span key={`s-${idx}`} className="govuk-tag govuk-tag--grey">
      <T count={flatFilters.length}>summary.all_values</T>
    </span>
  ];
  const selectedFilter = selectedFilterOptions.find((opt) => filter.factTableColumn === opt.columnName);
  if (selectedFilter && flatFilters.length > 1) {
    selectedValues = selectedFilter.values.map((val, oidx) => {
      const valName = filter.values.find((ref) => ref.reference === val)?.description || 'Unknown';
      return (
        <React.Fragment key={`s-${idx}-${oidx}`}>
          <span className="govuk-tag govuk-tag--grey">{valName}</span>{' '}
        </React.Fragment>
      );
    });
  } else if (flatFilters.length === 1) {
    selectedValues = [
      <span key={`s-${idx}`} className="govuk-tag govuk-tag--grey">
        {flatFilters[0].description}
      </span>
    ];
  }
  return selectedValues;
}
