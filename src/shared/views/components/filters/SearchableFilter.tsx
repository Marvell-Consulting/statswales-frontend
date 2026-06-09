import React from 'react';

import { FilterTable } from '../../../dtos/filter-table';
import { CheckboxGroup } from '../CheckboxGroup';
import T from '../T';
import { useLocals } from '../../context/Locals';
import { NO_JS_FILTER_CAP, cappedFilterValues, toSearchOptions } from './searchable-filter';

export type SearchableFilterProps = {
  filter: FilterTable;
  values?: string[];
  disabled?: boolean;
};

// Embed data as JSON inside a <script> without letting a stray "</script>" or
// "<!--" in a label break out of the element. JSON.parse reads < fine.
const safeJson = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');

// High-cardinality dimensions (thousands of values). Instead of one checkbox per
// value — which freezes the browser — we render a search-driven selector:
//   - the full value list is embedded once as compact JSON for the client script
//   - JS builds a typeahead + chips UI from it (filter-search.js)
//   - without JS a capped list of plain checkboxes is shown as a fallback
export const SearchableFilter = ({ filter, values, disabled = false }: SearchableFilterProps) => {
  const { t, errors } = useLocals();
  const fieldName = `filter[${filter.factTableColumn}]`;
  const hasError = errors?.some((e) => e.field === fieldName);

  const total = filter.values.length;
  const filterId = `filter-${filter.factTableColumn.replaceAll(/\s+/g, '_')}`;

  // `values` is the active selection echoed back by the API (decoded references).
  const selected = values ?? [];
  const selectedEncoded = selected.map(encodeURIComponent);

  // Initial state: an active selection shows those chips; an error shows none;
  // otherwise the default is "all selected" (i.e. the dimension is not filtered).
  const initialState = hasError ? 'none' : selected.length > 0 ? 'some' : 'all';
  const selectedCount = initialState === 'all' ? total : selected.length;

  const options = toSearchOptions(filter.values);

  // No-JS fallback: render a capped slice of plain checkboxes so the dimension
  // remains (partially) usable without JavaScript.
  const cappedOptions = cappedFilterValues(filter.values, selected, NO_JS_FILTER_CAP);
  const cappedNormalized = cappedOptions.map((opt) => ({
    label: opt.description,
    value: encodeURIComponent(opt.reference),
    disabled: opt.count === '0'
  }));
  const cappedCheckedValues = hasError ? [] : selectedEncoded;

  return (
    <div
      className="filter filter--searchable"
      id={filterId}
      data-total={total}
      data-column={filter.factTableColumn}
      data-searchable
    >
      <details className="dimension-accordion" open={hasError || undefined}>
        <summary className="dimension-accordion__summary">
          <span className="dimension-accordion__title">{filter.columnName}</span>
        </summary>

        {hasError && (
          <p className="filter-error govuk-error-message">
            <span className="govuk-visually-hidden">Error: </span>
            <T columnName={filter.columnName} raw>
              filters.no_values_selected
            </T>
          </p>
        )}

        <div className="dimension-accordion__count">
          <T filtered={selectedCount} total={total} raw>
            filters.summary
          </T>
        </div>

        <div className="filter-container option-select">
          <script
            type="application/json"
            className="filter-options-data"
            dangerouslySetInnerHTML={{ __html: safeJson(options) }}
          />
          <script
            type="application/json"
            className="filter-state-data"
            dangerouslySetInnerHTML={{ __html: safeJson({ state: initialState, selected: selectedEncoded }) }}
          />

          {/* Enhanced by filter-search.js once JS is available */}
          <div className="filter-search-app js-only" hidden>
            <div className="filter-search-controls">
              <button type="button" className="filter-search-select-all govuk-link button-as-link">
                <T columnName={filter.columnName} raw>
                  filters.searchable.select_all
                </T>
              </button>
              <button type="button" className="filter-search-clear govuk-link button-as-link">
                <T columnName={filter.columnName} raw>
                  filters.searchable.clear
                </T>
              </button>
            </div>
            <div
              className="filter-search-input-wrap"
              data-placeholder={t('filters.search.placeholder')}
              data-aria={t('filters.search.aria', { columnName: filter.columnName })}
              data-no-match={t('filters.search.no_match')}
              data-remove-label={t('filters.searchable.remove')}
            />
            <ul className="filter-chips" />
          </div>

          {/* No-JS fallback */}
          <div className="filter-nojs">
            <p className="govuk-body govuk-!-font-size-16">
              <T total={total} cap={Math.min(NO_JS_FILTER_CAP, total)} raw>
                filters.searchable.no_js_notice
              </T>
            </p>
            <div className="filter-body">
              <CheckboxGroup
                name={`filter[${filter.factTableColumn}]`}
                options={cappedNormalized}
                values={cappedCheckedValues}
              />
            </div>
          </div>
        </div>

        {disabled ? null : (
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
        )}
      </details>
    </div>
  );
};
