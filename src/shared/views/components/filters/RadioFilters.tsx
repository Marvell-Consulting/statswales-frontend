import React from 'react';

import { FilterTable } from '../../../dtos/filter-table';
import { RadioFilter } from './RadioFilter';
import T from '../T';
import { Filter } from '../../../interfaces/filter';
import { useLocals } from '../../context/Locals';
import { DatasetDTO } from '../../../dtos/dataset';

export type RadioFiltersProps = {
  filters: FilterTable[];
  url: string;
  title: string;
  selected: Filter[];
  dataset: DatasetDTO;
  preview?: boolean;
};

export const RadioFilters = (props: RadioFiltersProps) => {
  const { filters, title, selected, preview, dataset } = props;
  const { buildUrl, i18n } = useLocals();

  const activeFilters = selected?.length > 0;

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
        return <RadioFilter key={index} filter={filter} values={values} />;
      })}
      <script type="module" src="/assets/js/filters.js" />
    </div>
  );
};
