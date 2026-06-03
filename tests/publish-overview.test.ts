import request from 'supertest';
import JWT from 'jsonwebtoken';
import { http, HttpResponse } from 'msw';

import app from '../src/publisher/app';
import { config } from '../src/shared/config';
import { GlobalRole } from '../src/shared/enums/global-role';
import { UserStatus } from '../src/shared/enums/user-status';
import { mockBackend } from './mocks/backend';
import { completedDataset } from './mocks/fixtures';

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

describe('Publish overview page', () => {
  const jwt = JWT.sign({ user: testUser }, config.auth.jwt.secret);
  const datasetId = completedDataset.id;
  const consumerUrl = config.frontend.consumer.url;

  // The URL is interpolated into a translation string and rendered via i18next, which HTML-escapes
  // the value — so forward slashes appear as &#x2F; in the response body.
  const htmlEscape = (value: string) => value.replace(/\//g, '&#x2F;');
  const englishUrl = htmlEscape(`${consumerUrl}/en-GB/${datasetId}/start`);
  const welshUrl = htmlEscape(`${consumerUrl}/cy-GB/${datasetId}/start`);

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
        // completedDataset has no first_published_at / archived_at, so it resolves to status 'new'
        return HttpResponse.json(completedDataset);
      }),
      http.get(`${config.backend.url}/dataset/${datasetId}/history`, () => {
        return HttpResponse.json([]);
      })
    );
  });

  afterEach(() => mockBackend.resetHandlers());
  afterAll(() => mockBackend.close());

  const makeAgent = () => {
    const agent = request.agent(app);
    agent.set('Cookie', `jwt=${jwt}`);
    return agent;
  };

  test('shows both the English and Welsh published URLs in English', async () => {
    const agent = makeAgent();
    const res = await agent.get(`/en-GB/publish/${datasetId}/overview`);

    expect(res.status).toBe(200);
    expect(res.text).toContain(englishUrl);
    expect(res.text).toContain(welshUrl);
    expect(res.text).toContain('English:');
    expect(res.text).toContain('Welsh:');
  });

  test('shows both the English and Welsh published URLs in Welsh', async () => {
    const agent = makeAgent();
    const res = await agent.get(`/cy-GB/publish/${datasetId}/overview`);

    expect(res.status).toBe(200);
    expect(res.text).toContain(englishUrl);
    expect(res.text).toContain(welshUrl);
    // Welsh labels, confirming the cy.json keys resolve rather than falling back to English
    expect(res.text).toContain('Saesneg:');
    expect(res.text).toContain('Cymraeg:');
  });
});
