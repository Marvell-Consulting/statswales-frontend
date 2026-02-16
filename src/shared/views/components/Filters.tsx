import React from 'react';
import { clsx } from 'clsx';

import { FilterTable, FilterValues } from '../../dtos/filter-table';
import { Checkbox, CheckboxGroup, CheckboxOptions, Controls } from './CheckboxGroup';
import T from './T';
import { Filter } from '../../interfaces/filter';
import { useLocals } from '../context/Locals';
import { DatasetDTO } from '../../dtos/dataset';

export type FiltersProps = {
  filters: FilterTable[];
  url: string;
  title: string;
  selected: Filter[];
  dataset: DatasetDTO;
  preview?: boolean;
};

const normalizeFilters = (options: FilterValues[]): CheckboxOptions[] => {
  return options.map((opt) => {
    return {
      label: opt.description,
      value: encodeURIComponent(opt.reference), // this is used in checkbox input name
      children: opt.children ? normalizeFilters(opt.children) : undefined
    };
  });
};

const filterOptionCount = (options: FilterValues[]): number => {
  return options.reduce((count, opt) => {
    const childCount = opt.children ? filterOptionCount(opt.children) : 0;
    return count + childCount + 1;
  }, 0);
};

export const Filters = (props: FiltersProps) => {
  const { filters, title, selected, preview, dataset } = props;
  const { buildUrl, i18n, t } = useLocals();

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
        const filtered = values?.length;
        const total = filterOptionCount(filter.values);
        const filterId = `filter-${filter.factTableColumn.replaceAll(/[^a-zA-Z0-9]/g, '_')}`;

        return (
          <div className="filters" id={filterId} key={index}>
            <h3 className="region-subhead">
              {filter.columnName} (
              <T filtered={filtered} total={total} className={clsx('filtered-label', { 'js-hidden': !filtered })} raw>
                filters.summary
              </T>
              <T total={total} className={clsx('non-filtered-label', { 'js-hidden': filtered })} raw>
                filters.non-filtered-summary
              </T>
              )
            </h3>
            <div className="filter-container option-select">
              <div className="padding-box">
                <div className="filter-search js-hidden">
                  <input
                    type="text"
                    id={`${filterId}-search`}
                    className="govuk-input filter-search-input"
                    placeholder={t('filters.search_placeholder')}
                    aria-label={t('filters.search_aria', { columnName: filter.columnName })}
                  />
                </div>
                <div className="filter-head non-js-hidden">
                  <Controls
                    className="parent-controls"
                    selectAllLabel={
                      <T columnName={filter.columnName} raw>
                        filters.select_all
                      </T>
                    }
                    noneLabel={
                      <T columnName={filter.columnName} raw>
                        filters.none
                      </T>
                    }
                  />
                  <div className="govuk-checkboxes--small">
                    <Checkbox
                      checked={!values}
                      label={
                        <T columnName={filter.columnName} raw>
                          filters.no_filter
                        </T>
                      }
                      name={`filter-${filter.factTableColumn}-all`}
                      value="all"
                      omitName
                      values={Array.isArray(values) ? values : []}
                    />
                  </div>
                </div>
              </div>
              <div className="filter-body">
                <CheckboxGroup
                  name={`filter[${filter.factTableColumn}]`}
                  options={normalizeFilters(filter.values)}
                  values={values ?? []}
                  independentExpand
                />
              </div>
            </div>
          </div>
        );
      })}
      <script type="module" src="/assets/js/filters.js" />
    </div>
  );
};
