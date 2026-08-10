import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import DimensionMatchFailure from '../../src/publisher/views/publish/dimension-match-failure.jsx';
import MeasureMatchFailure from '../../src/publisher/views/publish/measure-match-failure.jsx';

const XSS_PAYLOAD = '<img src=x onerror=alert(1)>';

const baseProps = {
  t: (key: string) => key,
  buildUrl: (path: string) => path,
  url: '/back',
  i18n: { language: 'en-GB' },
  isAuthenticated: true,
  activePage: 'publish',
  isAdmin: false,
  isDeveloper: false,
  appEnv: 'local',
  hostname: 'localhost',
  datasetId: 'dataset-1',
  dataset: { id: 'dataset-1' }
};

describe('DimensionMatchFailure — uploaded lookup/fact-table values that failed to match', () => {
  const render = (nonMatchingDataTableValues: unknown[], nonMatchedLookupValues: unknown[] = []) =>
    renderToStaticMarkup(
      <DimensionMatchFailure
        {...baseProps}
        patchRequest={{ dimension_type: 'lookup_table' }}
        dimension={{ id: 'dim-1', metadata: { name: 'Area' } }}
        dimensionPatch={{}}
        extension={{
          totalNonMatching: nonMatchingDataTableValues.length,
          nonMatchingDataTableValues,
          nonMatchedLookupValues
        }}
      />
    );

  it('renders a fact-table value containing an img onerror payload inert', () => {
    const html = render([XSS_PAYLOAD]);
    // React's default escaping neutralizes the tag; "onerror" survives only as inert escaped text
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('renders a lookup-table value containing a script payload inert', () => {
    const html = render([], ['<script>alert(1)</script>']);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('still shows the benign value, quoted, with no leftover [object Object] from the old String.replace bug', () => {
    const html = render(['North Wales']);
    expect(html).toContain('North');
    expect(html).toContain('Wales');
    expect(html).not.toContain('[object Object]');
  });
});

describe('MeasureMatchFailure — uploaded measure lookup values that failed to match', () => {
  const render = (nonMatchingDataTableValues: unknown[], nonMatchingLookupValues: unknown[] = []) =>
    renderToStaticMarkup(
      <MeasureMatchFailure
        {...baseProps}
        measure={{ id: 'measure-1', metadata: { name: 'Count' } }}
        extension={{
          totalNonMatching: nonMatchingDataTableValues.length,
          nonMatchingDataTableValues,
          nonMatchingLookupValues
        }}
      />
    );

  it('renders a fact-table value containing an img onerror payload inert', () => {
    const html = render([XSS_PAYLOAD]);
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('renders a measure-lookup value containing a script payload inert', () => {
    const html = render([], ['<script>alert(1)</script>']);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
