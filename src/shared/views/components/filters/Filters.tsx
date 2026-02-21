import React, { ReactNode } from 'react';

import { FilterTable } from '../../../dtos/filter-table';
import { CheckboxFilter } from './CheckboxFilter';
import { RadioFilter } from './RadioFilter';
import T from '../T';
import { Filter } from '../../../interfaces/filter';
import { useLocals } from '../../context/Locals';
import { DatasetDTO } from '../../../dtos/dataset';

export type FiltersProps = {
  filters: FilterTable[];
  url: string;
  title: string;
  selected: Filter[];
  dataset: DatasetDTO;
  preview?: boolean;
  columns?: string;
  rows?: string;
};

export const Filters = (props: FiltersProps) => {
  const { filters, title, selected, preview, dataset } = props;
  const { buildUrl, i18n } = useLocals();

  const activeFilters = selected?.length > 0;
  const isPivot = !!(props.rows && props.columns);

  const clearFiltersLink = preview
    ? buildUrl(`/publish/${dataset.id}/cube-preview`, i18n.language)
    : buildUrl(`/${dataset.id}`, i18n.language);

  return (
    <div className="filters-container">
      <div className="filters-head">
        <h2 className="govuk-heading-m">{title}</h2>
        {!!activeFilters && (
          <a href={clearFiltersLink} className={'clear-filters'}>
            <T>filters.clear</T>
          </a>
        )}
      </div>

      {filters?.map((filter, index) => {
        const values = selected?.find((f) => f.columnName === filter.factTableColumn)?.values;

        let tag: ReactNode | null = null;
        if (isPivot && filter.factTableColumn === props.columns) {
          tag = (
            <span className="govuk-tag govuk-tag--blue">
              <T>summary.visibility.columns</T>
            </span>
          );
        } else if (isPivot && filter.factTableColumn === props.rows) {
          tag = (
            <span className="govuk-tag govuk-tag--blue">
              <T>summary.visibility.rows</T>
            </span>
          );
        }

        const isHiddenDimension = isPivot && !tag;

        if (isHiddenDimension) {
          return <RadioFilter key={index} filter={filter} values={values} />;
        }

        return <CheckboxFilter key={index} filter={filter} values={values} tag={tag} />;
      })}
      <script type="module" src="/assets/js/filters.js" />
    </div>
  );
};
