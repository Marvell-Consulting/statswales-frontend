import React from 'react';
import { clsx } from 'clsx';

import { FilterTable, FilterValues } from '../../dtos/filter-table';
import T from './T';
import { Filter } from '../../interfaces/filter';
import { useLocals } from '../context/Locals';
import { DatasetDTO } from '../../dtos/dataset';

export type RadioFiltersProps = {
  filters: FilterTable[];
  url: string;
  title: string;
  selected: Filter[];
  dataset: DatasetDTO;
  preview?: boolean;
};

type RadioOption = {
  label: string;
  value: string;
  children?: RadioOption[];
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

const RadioItem = ({
  name,
  label,
  value,
  children,
  checked,
  selectedValue
}: RadioOption & {
  name: string;
  checked?: boolean;
  selectedValue?: string;
}) => {
  const formattedId = `${name}.${value}`.replaceAll(/\s+/g, '_');

  return (
    <>
      <div className="govuk-radios__item">
        <input
          className="govuk-radios__input"
          id={formattedId}
          name={name}
          type="radio"
          value={value}
          data-aria-controls={children ? `conditional-${formattedId}` : undefined}
          defaultChecked={checked}
        />
        <label className="govuk-label govuk-radios__label" htmlFor={formattedId}>
          {label}
        </label>
      </div>
      {children && (
        <div className="govuk-radios__conditional govuk-radios__conditional--hidden" id={`conditional-${formattedId}`}>
          <FilterRadioGroup options={children} name={`${name}.${value}`} selectedValue={selectedValue} />
        </div>
      )}
    </>
  );
};

const FilterRadioGroup = ({
  options,
  name,
  selectedValue
}: {
  options: RadioOption[];
  name: string;
  selectedValue?: string;
}) => {
  return (
    <div className="govuk-radios govuk-radios--small" data-module="govuk-radios">
      {options.map((option, index) => (
        <RadioItem
          key={index}
          name={name}
          checked={selectedValue === option.value}
          {...option}
          selectedValue={selectedValue}
        />
      ))}
    </div>
  );
};

export const RadioFilters = (props: RadioFiltersProps) => {
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
        const selectedValue = values?.[0];
        const total = filterOptionCount(filter.values);
        const filterId = `filter-${filter.factTableColumn.replaceAll(/\s+/g, '_')}`;

        return (
          <div className="filters" id={filterId} key={index}>
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
                <div className="filter-head">
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
      })}
      <script type="module" src="/assets/js/filters.js" />
    </div>
  );
};
