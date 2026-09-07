import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import DownloadTab from '../../src/consumer/views/dataset/components/DownloadTab';
import { LocalsProvider } from '../../src/shared/views/context/Locals';
import { ViewError } from '../../src/shared/dtos/view-error';

const baseProps = {
  dataset: { id: 'test-dataset-id' },
  selectedFilterOptions: []
};

// a no-op translator/buildUrl is enough - we only assert on structure, not copy
const render = (errors?: ViewError[]) =>
  renderToStaticMarkup(
    <LocalsProvider
      t={(key: string) => key}
      i18n={{ t: (key: string) => key, language: 'en-GB' }}
      buildUrl={(path: string) => path}
      errors={errors}
    >
      <DownloadTab {...baseProps} />
    </LocalsProvider>
  );

const countChecked = (html: string) => (html.match(/checked/g) || []).length;

describe('DownloadTab — no radio pre-selected (SW-1334)', () => {
  test('renders with nothing checked on first load', () => {
    const html = render();
    expect(countChecked(html)).toBe(0);
  });

  test('still renders every radio group (view type, format, number formatting, reference codes, language)', () => {
    const html = render();
    expect(html).toContain('name="view_type"');
    expect(html).toContain('name="format"');
    expect(html).toContain('name="view_choice"');
    expect(html).toContain('name="extended"');
    expect(html).toContain('name="download_language"');
  });

  test('shows the field-level error message for a required field that was left unselected', () => {
    const html = render([{ field: 'format', message: { key: 'consumer_view.downloads.file_type.errors.missing' } }]);
    expect(html).toContain('consumer_view.downloads.file_type.errors.missing');
  });

  test('does not show an error message for a field with no error', () => {
    const html = render([{ field: 'format', message: { key: 'consumer_view.downloads.file_type.errors.missing' } }]);
    expect(html).not.toContain('consumer_view.downloads.type.errors.missing');
  });
});
