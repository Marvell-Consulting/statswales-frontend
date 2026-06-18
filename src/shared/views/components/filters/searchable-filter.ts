import { FilterTable, FilterValues } from '../../../dtos/filter-table';

// Above this many values a dimension is rendered as a searchable selector
// (typeahead + chips) instead of one checkbox per value. Rendering tens of
// thousands of checkboxes freezes the browser, so we cap what hits the DOM.
export const SEARCHABLE_FILTER_THRESHOLD = 1000;

// How many values the no-JS fallback renders as plain checkboxes. JS users get
// the full list via the embedded JSON; without JS only this many are reachable.
export const NO_JS_FILTER_CAP = 1000;

// Compact tuple used for the embedded JSON: [label, encodedValue, disabled?].
// Tuples keep the payload small — there can be tens of thousands of these.
type SearchOption = [label: string, value: string] | [label: string, value: string, disabled: 1];

// A filter is only made searchable when it's a flat list (no hierarchy) above
// the threshold. Hierarchical dimensions keep the existing tree of checkboxes —
// flattening one into a search list would lose the parent/child structure.
const isFlat = (values: FilterValues[]): boolean => values.every((v) => !v.children?.length);

export const isSearchableFilter = (filter: FilterTable, threshold: number = SEARCHABLE_FILTER_THRESHOLD): boolean => {
  return isFlat(filter.values) && filter.values.length > threshold;
};

// The subset rendered for the no-JS fallback: any currently-selected values
// first (so an active filter still shows its selection), then fill up to the
// cap with the remaining values. `selected` holds decoded references.
export const cappedFilterValues = (
  values: FilterValues[],
  selected: string[] = [],
  cap: number = NO_JS_FILTER_CAP
): FilterValues[] => {
  if (values.length <= cap) return values;

  const selectedSet = new Set(selected);
  const chosen = values.filter((v) => selectedSet.has(v.reference));
  if (chosen.length >= cap) return chosen.slice(0, cap);

  const rest = values.filter((v) => !selectedSet.has(v.reference));
  return [...chosen, ...rest.slice(0, cap - chosen.length)];
};

// Encode references the same way normalizeFilters does, so the values submitted
// by the search selector match what the server expects from a ticked checkbox.
export const toSearchOptions = (values: FilterValues[]): SearchOption[] => {
  return values.map((opt) =>
    opt.count === '0'
      ? [opt.description, encodeURIComponent(opt.reference), 1]
      : [opt.description, encodeURIComponent(opt.reference)]
  );
};
