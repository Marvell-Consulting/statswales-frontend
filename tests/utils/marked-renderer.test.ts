import { Marked } from 'marked';

import { docRenderer, metadataRenderer, sanitizeHref } from '../../src/shared/services/marked';

describe('sanitizeHref', () => {
  it.each([
    'https://example.com/page?a=1',
    'http://example.com',
    'mailto:stats@gov.wales',
    '/en-GB/guidance/upload',
    '#section',
    'relative/path'
  ])('allows %s', (href) => {
    expect(sanitizeHref(href)).toBeDefined();
  });

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)'
  ])('rejects %j', (href) => {
    expect(sanitizeHref(href)).toBeUndefined();
  });

  it('escapes characters that could break out of the attribute', () => {
    expect(sanitizeHref('https://example.com/"><img src=x onerror=alert(1)>&x')).toBe(
      'https://example.com/&quot;&gt;&lt;img src=x onerror=alert(1)&gt;&amp;x'
    );
  });
});

describe.each([
  ['docRenderer', docRenderer],
  ['metadataRenderer', metadataRenderer]
])('%s (without DOMPurify)', (_name, renderer) => {
  const render = (md: string) => new Marked({ renderer }).parse(md, { async: false });

  it('renders allowed links as govuk links', () => {
    expect(render('[StatsWales](https://stats.gov.wales)')).toContain(
      '<a class="govuk-link" href="https://stats.gov.wales">StatsWales</a>'
    );
  });

  it('drops the anchor for javascript: links but keeps the text', () => {
    const html = render('[click me](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('<a');
    expect(html).toContain('click me');
  });

  it('only emits allow-listed align values on table cells', () => {
    const html = render('| a | b | c | d |\n|:--|--:|:-:|---|\n| 1 | 2 | 3 | 4 |');
    expect(html).toContain('align="left"');
    expect(html).toContain('align="right"');
    expect(html).toContain('align="center"');
    expect(html.match(/align="/g)).toHaveLength(6);
  });
});
