import request from 'supertest';

import app from '../src/publisher/app';
import { config } from '../src/shared/config';

import { mockBackend } from './mocks/backend';

describe('Guidance', () => {
  beforeAll(() => {
    mockBackend.listen({
      onUnhandledRequest: ({ url }, print) => {
        if (!url.includes(config.backend.url)) return;
        print.error();
      }
    });
  });

  afterEach(() => {
    mockBackend.resetHandlers();
  });

  afterAll(() => mockBackend.close());

  test('renders a guidance document', async () => {
    const res = await request(app).get('/en-GB/guidance/Using-SW3---Creating-a-new-dataset');
    expect(res.status).toBe(200);
    expect(res.text).toContain('govuk-heading-xl');
  });

  test('returns not found for a document that does not exist', async () => {
    const res = await request(app).get('/en-GB/guidance/does-not-exist');
    expect(res.status).toBe(404);
  });

  test.each([
    ['encoded forward slash traversal', '..%2F..%2F..%2FREADME'],
    ['encoded backslash traversal', '..%5C..%5C..%5CREADME'],
    ['encoded dot-dot into sibling dir', '%2E%2E%2Fcy%2FUsing-SW3---Creating-a-new-dataset'],
    ['encoded null byte', 'Using-SW3---Creating-a-new-dataset%00']
  ])('rejects %s', async (_label, file) => {
    const res = await request(app).get(`/en-GB/guidance/${file}`);
    expect(res.status).toBe(404);
  });
});
