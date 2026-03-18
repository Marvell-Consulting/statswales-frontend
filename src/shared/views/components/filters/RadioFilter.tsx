import React from 'react';

import { FilterTable, FilterValues } from '../../../dtos/filter-table';
import { FilterRadioGroup } from './FilterRadioGroup';
import { RadioOption } from './RadioItem';
import T from '../T';
import { useLocals } from '../../context/Locals';

export type RadioFilterProps = {
  filter: FilterTable;
  values?: string[];
};

const normalizeFilters = (options: FilterValues[]): RadioOption[] => {
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

export const RadioFilter = ({ filter, values }: RadioFilterProps) => {
  const { t } = useLocals();

  const isMeasure = filter.columnName === t('filters.measure');
  // `values[0]` is the active selection echoed back by the API (decoded, e.g. "2018/19").
  // Option values produced by normalizeFilters are encoded (e.g. "2018%2F19"), so we
  // must encode here before FilterRadioGroup compares with selectedValue === option.value.
  const selectedValue = values?.[0] ? encodeURIComponent(values[0]) : undefined;
  const total = filterOptionCount(filter.values);
  const filterId = `filter-${filter.factTableColumn.replaceAll(/\s+/g, '_')}`;

  return (
    <div className="filter" id={filterId} data-total={total} data-column={filter.factTableColumn}>
      <details className="dimension-accordion">
        <summary className="dimension-accordion__summary">
          <span className="dimension-accordion__title">{filter.columnName}</span>
        </summary>
        {isMeasure && (
          <p className="govuk-body">
            <T>filters.description_info</T>
          </p>
        )}
        <div className="dimension-accordion__count">
          <T filtered={selectedValue ? 1 : 0} total={total} raw>
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
          </div>
          <div className="filter-body">
            <FilterRadioGroup
              name={`filter[${filter.factTableColumn}]`}
              options={normalizeFilters(filter.values)}
              selectedValue={selectedValue}
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
