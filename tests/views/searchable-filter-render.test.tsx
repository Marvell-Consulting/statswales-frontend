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
    expect(html).toContain('filter-search-app');
    // the full value list is embedded once as JSON for the client script
    expect(html).toContain('application/json');
    expect(html).toContain('filter-options-data');
    // only the no-JS fallback checkboxes hit the DOM — capped, not 44k
    expect(countCheckboxes(html)).toBeLessThanOrEqual(NO_JS_FILTER_CAP);
  });

  test('an active selection on a huge dimension is preserved in the embedded state', () => {
    const html = render({ columnName: 'Drug', factTableColumn: 'drug', values: flatValues(44000) }, ['ref-5']);
    // encoded selection echoed into the state script the client reads on load
    expect(html).toContain('"state":"some"');
    expect(html).toContain('ref-5');
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
