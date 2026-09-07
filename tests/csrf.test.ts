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

// the cookie banner (rendered on every page) carries its own "_csrf" field for the separate
// double-submit-cookie mechanism, so it must be stripped out before looking for the
// session-bound token in the page's actual form
const extractCsrfToken = (html: string): string => {
  const withoutCookieBanner = html.replace(/<form id="cookie-banner-form"[\s\S]*?<\/form>/, '');
  const inputMatch = withoutCookieBanner.match(/<input\b[^>]*\bname="_csrf"[^>]*>/);
  const valueMatch = inputMatch?.[0].match(/\bvalue="([^"]*)"/);
  if (!valueMatch) throw new Error('Could not find CSRF token in rendered page');
  return valueMatch[1];
};

describe('CSRF protection on publisher state-changing routes', () => {
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
      }),
      http.patch(`${config.backend.url}/dataset/${datasetId}/metadata`, () => {
        return HttpResponse.json(completedDataset);
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

  test('rejects a state-changing POST with no CSRF token, as a cross-site attacker page could send', async () => {
    const agent = makeAgent();
    await agent.get(`/en-GB/publish/${datasetId}/summary`);

    const res = await agent.post(`/en-GB/publish/${datasetId}/summary`).field('summary', 'a legitimate summary');

    expect(res.status).toBe(403);
  });

  test('rejects a state-changing POST with a CSRF token that does not match the session', async () => {
    const agent = makeAgent();
    await agent.get(`/en-GB/publish/${datasetId}/summary`);

    const res = await agent
      .post(`/en-GB/publish/${datasetId}/summary`)
      .field('summary', 'a legitimate summary')
      .field('_csrf', 'guessed-or-stale-token');

    expect(res.status).toBe(403);
  });

  test('accepts a same-site POST that includes the CSRF token rendered into the form', async () => {
    const agent = makeAgent();
    const formPage = await agent.get(`/en-GB/publish/${datasetId}/summary`);
    const csrfToken = extractCsrfToken(formPage.text);

    const res = await agent
      .post(`/en-GB/publish/${datasetId}/summary`)
      .field('summary', 'a legitimate summary')
      .field('_csrf', csrfToken);

    expect(res.status).toBe(302);
    expect(res.header.location).toBe(`/en-GB/publish/${datasetId}/tasklist`);
  });

  test('accepts the CSRF token via the x-csrf-token header for AJAX-style requests', async () => {
    const agent = makeAgent();
    const formPage = await agent.get(`/en-GB/publish/${datasetId}/summary`);
    const csrfToken = extractCsrfToken(formPage.text);

    const res = await agent
      .post(`/en-GB/publish/${datasetId}/summary`)
      .set('x-csrf-token', csrfToken)
      .field('summary', 'a legitimate summary');

    expect(res.status).toBe(302);
  });
});
