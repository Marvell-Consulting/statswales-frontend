import { Request } from 'express';

import { config } from '../../src/shared/config';
import { safeReferer } from '../../src/shared/utils/safe-referer';

const fallback = '/en-GB/dataset-id#dataset-nav';

const reqWithReferer = (referer?: string) => ({ get: () => referer }) as unknown as Request;

describe('safeReferer', () => {
  const originalWelshUrl = config.frontend.consumer.welshUrl;

  afterEach(() => {
    config.frontend.consumer.welshUrl = originalWelshUrl;
  });

  test.each([
    `${config.frontend.consumer.url}/en-GB/dataset-id/filtered?page=2`,
    `${config.frontend.publisher.url}/en-GB/publish/dataset-id/cube-preview`
  ])('redirects back to a same-origin referer: %s', (referer) => {
    expect(safeReferer(reqWithReferer(referer), fallback)).toBe(referer);
  });

  test('redirects back to the Welsh consumer domain when configured', () => {
    config.frontend.consumer.welshUrl = 'https://ystadegau.example.cymru';
    const referer = 'https://ystadegau.example.cymru/cy-GB/dataset-id';
    expect(safeReferer(reqWithReferer(referer), fallback)).toBe(referer);
  });

  test.each([
    ['missing', undefined],
    ['empty', ''],
    ['an external site', 'https://evil.example.com/en-GB/dataset-id'],
    ['a lookalike host', `${config.frontend.consumer.url}.evil.example.com/en-GB`],
    ['the same host on another port', 'http://localhost:9999/en-GB'],
    ['the same host over another scheme', config.frontend.consumer.url.replace('http:', 'https:')],
    ['protocol-relative', '//evil.example.com/en-GB'],
    ['a relative path', '/en-GB/dataset-id'],
    ['a javascript: url', 'javascript:alert(1)'],
    ['unparseable', 'http://']
  ])('falls back when the referer is %s', (_label, referer) => {
    expect(safeReferer(reqWithReferer(referer), fallback)).toBe(fallback);
  });
});
