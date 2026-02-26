import React, { ReactNode } from 'react';
import { FilterTable, FilterValues } from '../../../dtos/filter-table';
import { FilterControls } from './FilterControls';
import { CheckboxOptions } from '../Checkbox';
import { CheckboxGroup } from '../CheckboxGroup';
import T from '../T';
import { useLocals } from '../../context/Locals';

export type CheckboxFilterProps = {
  filter: FilterTable;
  values?: string[];
  tag?: ReactNode;
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

// Returns every option value in the tree, encoded to match normalizeFilters.
// Used as the default when no selection has been made (i.e. everything is checked).
const allOptionValues = (options: FilterValues[]): string[] => {
  return options.flatMap((opt) => [
    encodeURIComponent(opt.reference),
    ...(opt.children ? allOptionValues(opt.children) : [])
  ]);
};

export const CheckboxFilter = ({ filter, values }: CheckboxFilterProps) => {
  const { t } = useLocals();

  const filtered = values?.length;
  const total = filterOptionCount(filter.values);
  const filterId = `filter-${filter.factTableColumn.replaceAll(/\s+/g, '_')}`;

  // `values` is the active selection echoed back by the API (decoded, e.g. "2018/19").
  // Option values produced by normalizeFilters are encoded (e.g. "2018%2F19"), so we
  // must encode here before CheckboxGroup compares them with values.includes().
  // When no selection exists yet, default to every option checked.
  const checkedValues = values
    ? values.map(encodeURIComponent) // active selection — encode to match option values
    : allOptionValues(filter.values); // no selection yet — default to all options checked

  return (
    <div className="filter" id={filterId} data-total={total}>
      <details className="dimension-accordion">
        <summary className="dimension-accordion__summary">
          <span className="dimension-accordion__title">{filter.columnName}</span>
        </summary>
        <div className="dimension-accordion__count">
          <T filtered={filtered ?? total} total={total} raw>
            filters.summary
          </T>
        </div>
        <div className="filter-container option-select">
          <div className="filter-head js-hidden">
            <div className="filter-search js-hidden">
              <input
                type="text"
                id={`${filterId}-search`}
                className="govuk-input filter-search-input"
                placeholder={t('filters.search.placeholder')}
                aria-label={t('filters.search.aria', { columnName: filter.columnName })}
              />
            </div>
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
              values={checkedValues}
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
        <div className="filter-apply">
          <button
            name="dataViewsChoice"
            value="filter"
            type="submit"
            className="govuk-button govuk-button-small button-black"
            data-module="govuk-button"
          >
            <T>filters.apply_all_selections</T>
          </button>
        </div>
      </details>
    </div>
  );
};
