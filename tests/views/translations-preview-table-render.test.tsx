import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import TranslationsPreviewTable from '../../src/publisher/views/components/TranslationsPreviewTable';
import { LocalsProvider } from '../../src/shared/views/context/Locals';
import { TranslationDTO } from '../../src/shared/dtos/translations';
import { markdownToHtml } from '../../src/shared/utils/translations';

const XSS_PAYLOAD = '<img src=x onerror=alert(1)>';

const render = (translations: TranslationDTO[], isImport = true) =>
  renderToStaticMarkup(
    <LocalsProvider t={(key: string) => key} i18n={{ language: 'en-GB' }} url="/" errors={[]}>
      <TranslationsPreviewTable translations={translations} isImport={isImport} />
    </LocalsProvider>
  );

describe('TranslationsPreviewTable — uploaded translation import preview', () => {
  it('renders a payload from a non-metadata row inert (this is the worst-case row: only metadata used to be sanitized)', async () => {
    const rows: TranslationDTO[] = [{ type: 'dimension', key: 'name', english: XSS_PAYLOAD, cymraeg: 'Ardal' }];

    // Mirrors the real controller flow: parseUploadedTranslations -> markdownToHtml -> render
    const sanitized = await markdownToHtml(rows);
    const html = render(sanitized);

    // DOMPurify keeps the harmless <img> tag but strips the dangerous event handler
    expect(html).not.toContain('onerror');
  });

  it('renders a <script> payload from a metadata row inert', async () => {
    const rows: TranslationDTO[] = [
      { type: 'metadata', key: 'description', english: '<script>alert(1)</script>', cymraeg: 'ok' }
    ];

    const sanitized = await markdownToHtml(rows);
    const html = render(sanitized);

    expect(html).not.toContain('<script>');
  });

  it('still shows benign uploaded content', async () => {
    const rows: TranslationDTO[] = [{ type: 'dimension', key: 'name', english: 'Area', cymraeg: 'Ardal' }];

    const sanitized = await markdownToHtml(rows);
    const html = render(sanitized);

    expect(html).toContain('Area');
  });
});
