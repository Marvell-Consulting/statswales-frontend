import React from 'react';
import { clsx } from 'clsx';

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

  const selectedValue = values?.[0];
  const total = filterOptionCount(filter.values);
  const filterId = `filter-${filter.factTableColumn.replaceAll(/\s+/g, '_')}`;

  return (
    <div className="filter" id={filterId}>
      <h3 className="region-subhead">
        {filter.columnName} (
        <T
          filtered={selectedValue ? 1 : undefined}
          total={total}
          className={clsx('filtered-label', { 'js-hidden': !selectedValue })}
          raw
        >
          filters.summary
        </T>
        <T total={total} className={clsx('non-filtered-label', { 'js-hidden': !!selectedValue })} raw>
          filters.non-filtered-summary
        </T>
        )
      </h3>
      <div className="filter-container option-select">
        <div className="filter-head">
          <div className="filter-search js-hidden">
            <input
              type="text"
              id={`${filterId}-search`}
              className="govuk-input filter-search-input"
              placeholder={t('filters.search.placeholder')}
              aria-label={t('filters.search.aria', { columnName: filter.columnName })}
            />
          </div>
          <div className="govuk-radios--small">
            <div className="govuk-radios__item">
              <input
                className="govuk-radios__input"
                id={`${filterId}-all`}
                name={`filter[${filter.factTableColumn}]`}
                type="radio"
                value="all"
                defaultChecked={!selectedValue}
              />
              <label className="govuk-label govuk-radios__label" htmlFor={`${filterId}-all`}>
                <T columnName={filter.columnName} raw>
                  filters.no_filter
                </T>
              </label>
            </div>
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
    </div>
  );
};
