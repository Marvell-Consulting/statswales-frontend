import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Upload from '../../src/publisher/views/publish/upload.jsx';

// characters that would break out of a quoted JS string, a template literal or the <script> element itself
const BREAKOUT = `'"\`\${alert(1)}</script><script>alert(2)</script>`;

const baseProps = {
  t: (key: string) => `${key}${BREAKOUT}`,
  buildUrl: (path: string) => path,
  url: `/en-GB/publish/dataset-1/upload?x=${BREAKOUT}`,
  i18n: { language: 'en-GB' },
  isAuthenticated: true,
  activePage: 'publish',
  isAdmin: false,
  isDeveloper: false,
  appEnv: 'local',
  hostname: 'localhost',
  datasetId: 'dataset-1',
  cspNonce: 'test-nonce'
};

describe('Upload — inline upload script', () => {
  const html = renderToStaticMarkup(<Upload {...baseProps} />);
  // the layout renders its own nonce'd scripts, so pick out the upload one
  const inlineScript = [...html.matchAll(/<script nonce="test-nonce">([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .find((script) => script.includes('upload-form'));

  it('keeps interpolated URL and translations inside the script element', () => {
    expect(inlineScript).toBeDefined();
    expect(inlineScript).toContain('const form = document.getElementById("upload-form")');
    // an early </script> would cut the element short before its final statement
    expect(inlineScript).toContain('innerWrapper.appendChild(li);');
    expect(inlineScript).not.toContain('<script>alert(2)');
  });

  it('is still syntactically valid JavaScript', () => {
    // compiles without running it - a stray quote, backtick or ${ from an interpolated value would throw here
    expect(() => new Function(inlineScript!)).not.toThrow();
  });
});
