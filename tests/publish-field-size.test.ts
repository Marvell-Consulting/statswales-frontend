import request from 'supertest';
import JWT from 'jsonwebtoken';
import { http, HttpResponse } from 'msw';

import { i18next } from '../src/shared/middleware/translation';
import app from '../src/publisher/app';
import { config } from '../src/shared/config';
import { Locale } from '../src/shared/enums/locale';
import { GlobalRole } from '../src/shared/enums/global-role';
import { UserStatus } from '../src/shared/enums/user-status';
import { mockBackend } from './mocks/backend';
import { completedDataset } from './mocks/fixtures';
import { MULTIPART_FIELD_SIZE_LIMIT } from '../src/publisher/routes/publish';

const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  provider: 'test',
  global_roles: [] as GlobalRole[],
  groups: [],
  status: UserStatus.Active,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

describe('Publish route field size errors', () => {
  const t = i18next.t;
  const jwt = JWT.sign({ user: testUser }, config.auth.jwt.secret);
  const datasetId = completedDataset.id;

  beforeAll(() => {
    mockBackend.listen({
      onUnhandledRequest: ({ url }, print) => {
        if (!url.includes(config.backend.url)) return;
        print.error();
      }
    });
  });

  beforeEach(() => {
    mockBackend.use(
      http.get(`${config.backend.url}/dataset/${datasetId}`, () => {
        return HttpResponse.json(completedDataset);
      }),
      http.get(`${config.backend.url}/dataset/${datasetId}/tasks`, () => {
        return HttpResponse.json([]);
      })
    );
  });

  afterEach(() => {
    mockBackend.resetHandlers();
  });

  afterAll(() => mockBackend.close());

  const makeAgent = () => {
    const agent = request.agent(app);
    agent.set('Cookie', `jwt=${jwt}`);
    return agent;
  };

  const extractCsrfToken = (html: string): string => {
    const inputMatch = html.match(/<input\b[^>]*\bname="_csrf"[^>]*>/);
    const valueMatch = inputMatch?.[0].match(/\bvalue="([^"]*)"/);
    if (!valueMatch) throw new Error('Could not find CSRF token in rendered page');
    return valueMatch[1];
  };

  describe('POST /:datasetId/summary', () => {
    test('redirects back and shows error when summary exceeds field size limit', async () => {
      const agent = makeAgent();
      const formPage = await agent.get(`/en-GB/publish/${datasetId}/summary`);
      const csrfToken = extractCsrfToken(formPage.text);
      const oversizedValue = 'a'.repeat(MULTIPART_FIELD_SIZE_LIMIT + 1);

      const postRes = await agent
        .post(`/en-GB/publish/${datasetId}/summary`)
        .field('summary', oversizedValue)
        .field('_csrf', csrfToken);

      expect(postRes.status).toBe(302);
      expect(postRes.header.location).toBe(`/en-GB/publish/${datasetId}/summary`);

      const getRes = await agent.get(`/en-GB/publish/${datasetId}/summary`);

      expect(getRes.status).toBe(200);
      expect(getRes.text).toContain(t('publish.summary.form.description.error.too_long', { lng: Locale.English }));
    });
  });

  describe('POST /:datasetId/collection', () => {
    test('redirects back and shows error when collection exceeds field size limit', async () => {
      const agent = makeAgent();
      const formPage = await agent.get(`/en-GB/publish/${datasetId}/collection`);
      const csrfToken = extractCsrfToken(formPage.text);
      const oversizedValue = 'a'.repeat(MULTIPART_FIELD_SIZE_LIMIT + 1);

      const postRes = await agent
        .post(`/en-GB/publish/${datasetId}/collection`)
        .field('collection', oversizedValue)
        .field('_csrf', csrfToken);

      expect(postRes.status).toBe(302);
      expect(postRes.header.location).toBe(`/en-GB/publish/${datasetId}/collection`);

      const getRes = await agent.get(`/en-GB/publish/${datasetId}/collection`);

      expect(getRes.status).toBe(200);
      expect(getRes.text).toContain(t('publish.collection.form.collection.error.too_long', { lng: Locale.English }));
    });
  });
});
