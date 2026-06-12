import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CheckboxFilter } from '../../src/shared/views/components/filters/CheckboxFilter';
import { LocalsProvider } from '../../src/shared/views/context/Locals';
import { FilterTable, FilterValues } from '../../src/shared/dtos/filter-table';
import { NO_JS_FILTER_CAP } from '../../src/shared/views/components/filters/searchable-filter';

const flatValues = (count: number): FilterValues[] =>
  Array.from({ length: count }, (_, i) => ({ reference: `ref-${i}`, description: `Drug ${i}` }));

const render = (filter: FilterTable, values?: string[]) =>
  renderToStaticMarkup(
    // a no-op translator is enough — we only assert on structure, not copy
    <LocalsProvider t={(key: string) => key} errors={[]}>
      <CheckboxFilter filter={filter} values={values} />
    </LocalsProvider>
  );

const countCheckboxes = (html: string) => (html.match(/type="checkbox"/g) || []).length;

describe('CheckboxFilter — high-cardinality dimensions', () => {
  test('a small flat dimension still renders one checkbox per value', () => {
    const html = render({ columnName: 'Area', factTableColumn: 'area', values: flatValues(10) });
    expect(html).not.toContain('data-searchable');
    expect(countCheckboxes(html)).toBe(10);
  });

  test('a huge flat dimension renders the searchable selector, not 44k checkboxes', () => {
    const html = render({ columnName: 'Drug', factTableColumn: 'drug', values: flatValues(44000) });

    expect(html).toContain('data-searchable');
    // the full value list is embedded once as JSON for the client script
    expect(html).toContain('filter-options-data');
    // a search box is present to reach values beyond the rendered cap
    expect(html).toContain('filter-search-input');
  });

  test('renders the first cap values as real checkboxes (the part that fixes the freeze)', () => {
    const html = render({ columnName: 'Drug', factTableColumn: 'drug', values: flatValues(44000) });
    const count = countCheckboxes(html);
    // a usable list is shown immediately, but capped well below 44k
    expect(count).toBe(NO_JS_FILTER_CAP);
    expect(count).toBeGreaterThan(0);
  });

  test('carries an always-present filter_all sentinel so an untouched filter is "not filtered"', () => {
    const html = render({ columnName: 'Drug', factTableColumn: 'drug', values: flatValues(44000) });
    expect(html).toContain('name="filter_all[drug]"');
  });

  test('an active selection is rendered as checked checkboxes, selected-first', () => {
    const html = render({ columnName: 'Drug', factTableColumn: 'drug', values: flatValues(44000) }, ['ref-9000']);
    // the selected value is within the cap (selected-first) and checked
    expect(html).toContain('value="ref-9000"');
    expect(html).toContain('checked');
  });

  test('embedded JSON cannot break out of the script element', () => {
    const values: FilterValues[] = [
      { reference: 'x', description: '</script><script>alert(1)</script>' },
      ...flatValues(2000)
    ];
    const html = render({ columnName: 'Drug', factTableColumn: 'drug', values });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('\\u003c/script>');
  });
});
