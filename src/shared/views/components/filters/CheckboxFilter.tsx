import React from 'react';
import { clsx } from 'clsx';

import { FilterTable, FilterValues } from '../../../dtos/filter-table';
import { FilterControls } from './FilterControls';
import { CheckboxOptions } from '../Checkbox';
import { CheckboxGroup } from '../CheckboxGroup';
import T from '../T';
import { useLocals } from '../../context/Locals';

export type CheckboxFilterProps = {
  filter: FilterTable;
  values?: string[];
};

const normalizeFilters = (options: FilterValues[]): CheckboxOptions[] => {
  return options.map((opt) => {
    return {
      label: opt.description,
      value: encodeURIComponent(opt.reference),
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

const collectAllValues = (options: FilterValues[]): string[] => {
  return options.flatMap((opt) => [
    encodeURIComponent(opt.reference),
    ...(opt.children ? collectAllValues(opt.children) : [])
  ]);
};

export const CheckboxFilter = ({ filter, values }: CheckboxFilterProps) => {
  const { t } = useLocals();

  const filtered = values?.length;
  const total = filterOptionCount(filter.values);
  const filterId = `filter-${filter.factTableColumn.replaceAll(/\s+/g, '_')}`;
  const effectiveValues = values ?? collectAllValues(filter.values);

  return (
    <div className="filters" id={filterId} data-total={total}>
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
              placeholder={t('filters.search.placeholder')}
              aria-label={t('filters.search.aria', { columnName: filter.columnName })}
            />
          </div>
        </div>
        <div className="filter-head js-hidden">
          <FilterControls
            className="root-controls"
            deselectLabel={
              <T columnName={filter.columnName} raw>
                filters.deselect_all
              </T>
            }
            selectLabel={
              <T columnName={filter.columnName} raw>
                filters.select_all
              </T>
            }
          />
        </div>
        <div className="filter-body">
          <CheckboxGroup
            name={`filter[${filter.factTableColumn}]`}
            options={normalizeFilters(filter.values)}
            values={effectiveValues}
            independentExpand
            controls={
              <FilterControls
                deselectLabel={
                  <T columnName={filter.columnName} raw>
                    filters.deselect_all_level
                  </T>
                }
                selectLabel={
                  <T columnName={filter.columnName} raw>
                    filters.select_all_level
                  </T>
                }
              />
            }
          />
          <span className="filter-search-no-match govuk-body js-hidden">
            <T>filters.search.no_match</T>
          </span>
        </div>
      </div>
    </div>
  );
};
