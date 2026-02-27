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

const MAX_DISPLAYED_VALUES = 20;

export function SelectedFilterList(props: SelectFilterListProps): ReactNode[] {
  const { filter, flatFilters, selectedFilterOptions, idx } = props;
  let selectedValues = [
    <span key={`s-${idx}`} className="govuk-tag govuk-tag--grey govuk-tag--value">
      <T count={flatFilters.length}>summary.all_values</T>
    </span>
  ];
  const selectedFilter = selectedFilterOptions.find((opt) => filter.factTableColumn === opt.columnName);
  if (selectedFilter && flatFilters.length > 1) {
    const displayedValues = selectedFilter.values.slice(0, MAX_DISPLAYED_VALUES);
    const remainingCount = selectedFilter.values.length - MAX_DISPLAYED_VALUES;
    selectedValues = [
      ...displayedValues.map((val, oidx) => {
        const filterValue = flatFilters.find((ref) => ref.reference === val);
        return (
          <React.Fragment key={`s-${idx}-${oidx}`}>
            <span className="govuk-tag govuk-tag--blue govuk-tag--value">
              {filterValue?.description || <T>summary.unknown_value</T>}
            </span>{' '}
          </React.Fragment>
        );
      }),
      ...(remainingCount > 0
        ? [
            <span key={`s-${idx}-more`}>
              <T count={remainingCount}>summary.more_values</T>
            </span>
          ]
        : [])
    ];
  } else if (flatFilters.length === 1) {
    selectedValues = [
      <span key={`s-${idx}`} className="govuk-tag govuk-tag--grey govuk-tag--value">
        {flatFilters[0].description}
      </span>
    ];
  }
  return selectedValues;
}
