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

// High-cardinality dimensions (thousands of values). Rendering one checkbox per
// value freezes the browser, so we render the first NO_JS_FILTER_CAP values as a
// normal checkbox list and embed the full value list as JSON. filter-search.js
// lets the search box reach values beyond the rendered cap by injecting matching
// checkboxes on demand. Without JS the first cap values remain selectable.
//
// Selection is positive: the dimension is "not filtered" until the user ticks a
// value. An always-present filter_all sentinel encodes that default — when no
// value is checked the server treats the column as not filtered; when values are
// checked they apply via the filter[col].VALUE[] inputs. (See the cubePreview
// controller: the sentinel only suppresses the "select a value" validation;
// actual filtering is driven by the submitted filter[] values.)
export const SearchableFilter = ({ filter, values, disabled = false }: SearchableFilterProps) => {
  const { t, errors } = useLocals();
  const fieldName = `filter[${filter.factTableColumn}]`;
  const hasError = errors?.some((e) => e.field === fieldName);

  const total = filter.values.length;
  const cap = Math.min(NO_JS_FILTER_CAP, total);
  const filterId = `filter-${filter.factTableColumn.replaceAll(/\s+/g, '_')}`;

  // `values` is the active selection echoed back by the API (decoded references).
  const selected = values ?? [];
  const selectedEncoded = selected.map(encodeURIComponent);

  // Full list for the client search, and the capped slice rendered as checkboxes
  // (selected values first so an active selection is always on the page).
  const options = toSearchOptions(filter.values);
  const cappedOptions = cappedFilterValues(filter.values, selected, NO_JS_FILTER_CAP);
  const cappedNormalized = cappedOptions.map((opt) => ({
    label: opt.description,
    value: encodeURIComponent(opt.reference),
    disabled: opt.count === '0'
  }));

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
          <T filtered={selected.length} total={total} raw>
            filters.summary
          </T>
        </div>

        <div className="filter-container option-select">
          <script
            type="application/json"
            className="filter-options-data"
            dangerouslySetInnerHTML={{ __html: safeJson(options) }}
          />

          <p className="govuk-hint govuk-!-font-size-16 filter-searchable-notice">
            <T cap={cap} total={total} raw>
              filters.searchable.notice
            </T>
          </p>

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
            {!disabled && (
              <div className="filter-controls">
                <button type="button" className="filter-search-clear">
                  <T columnName={filter.columnName} raw>
                    filters.searchable.clear
                  </T>
                </button>
              </div>
            )}
          </div>

          <div className="filter-body">
            <CheckboxGroup name={fieldName} options={cappedNormalized} values={hasError ? [] : selectedEncoded} />
            <span className="filter-search-no-match govuk-body js-hidden">
              <T>filters.search.no_match</T>
            </span>
          </div>

          {/* Default = not filtered until a value is picked. Always present so the
              server never reports this column as missing a selection; submitted
              filter[] values still take effect when the user ticks options. */}
          {!disabled && <input type="hidden" name={`filter_all[${filter.factTableColumn}]`} value="1" />}
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
