import request from 'supertest';
import JWT from 'jsonwebtoken';
import { http, HttpResponse } from 'msw';

import app from '../src/publisher/app';
import { config } from '../src/shared/config';
import { GlobalRole } from '../src/shared/enums/global-role';
import { UserStatus } from '../src/shared/enums/user-status';
import { CubeBuildStatus } from '../src/shared/enums/cube-build-status';
import { mockBackend } from './mocks/backend';
import { completedDataset } from './mocks/fixtures';

const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  provider: 'test',
  global_roles: [GlobalRole.Developer] as GlobalRole[],
  groups: [],
  status: UserStatus.Active,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

describe('Rebuild cube', () => {
  const jwt = JWT.sign({ user: testUser }, config.auth.jwt.secret);
  const datasetId = completedDataset.id;
  const buildId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

  beforeAll(() => {
    mockBackend.listen({
      onUnhandledRequest: ({ url }, print) => {
        if (!url.includes(config.backend.url)) return;
        print.error();
      }
    });
  });

  afterEach(() => mockBackend.resetHandlers());
  afterAll(() => mockBackend.close());

  const makeAgent = () => {
    const agent = request.agent(app);
    agent.set('Cookie', `jwt=${jwt}`);
    return agent;
  };

  // Captures the revision id the rebuild request was made against, and responds with buildId.
  const mockRebuild = () => {
    let requestedRevisionId: string | undefined;
    mockBackend.use(
      http.post(`${config.backend.url}/dataset/${datasetId}/revision/by-id/:revisionId/`, ({ params }) => {
        requestedRevisionId = params.revisionId as string;
        return HttpResponse.json({ build_id: buildId });
      })
    );
    return () => requestedRevisionId;
  };

  const mockBuildLogEntry = (status: CubeBuildStatus) => {
    mockBackend.use(
      http.get(`${config.backend.url}/build/${buildId}`, () => {
        return HttpResponse.json({
          id: buildId,
          status,
          type: 'rebuild',
          startedAt: '2024-01-01T00:00:00.000Z',
          performanceStart: 0
        });
      })
    );
  };

  test('rebuilds using the draft revision when one exists, and redirects to the build status page', async () => {
    const draftRevisionId = 'draft-revision-id';
    mockBackend.use(
      http.get(`${config.backend.url}/dataset/${datasetId}`, () => {
        return HttpResponse.json({
          ...completedDataset,
          draft_revision_id: draftRevisionId,
          end_revision_id: 'end-revision-id'
        });
      })
    );
    const getRequestedRevisionId = mockRebuild();

    const res = await makeAgent().get(`/en-GB/developer/${datasetId}/rebuild/`);

    expect(getRequestedRevisionId()).toBe(draftRevisionId);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`/en-GB/publish/${datasetId}/build/${buildId}`);
  });

  test('falls back to the end revision when there is no draft revision', async () => {
    const endRevisionId = 'end-revision-id';
    mockBackend.use(
      http.get(`${config.backend.url}/dataset/${datasetId}`, () => {
        return HttpResponse.json({ ...completedDataset, draft_revision_id: undefined, end_revision_id: endRevisionId });
      })
    );
    const getRequestedRevisionId = mockRebuild();

    const res = await makeAgent().get(`/en-GB/developer/${datasetId}/rebuild/`);

    expect(getRequestedRevisionId()).toBe(endRevisionId);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`/en-GB/publish/${datasetId}/build/${buildId}`);
  });

  test('sends the developer back to the developer page after rebuilding from the developer preview', async () => {
    const endRevisionId = 'end-revision-id';
    mockBackend.use(
      http.get(`${config.backend.url}/dataset/${datasetId}`, () => {
        return HttpResponse.json({ ...completedDataset, draft_revision_id: undefined, end_revision_id: endRevisionId });
      })
    );
    mockRebuild();

    const agent = makeAgent();
    await agent
      .get(`/en-GB/developer/${datasetId}/rebuild/`)
      .set('Referer', `http://localhost/en-GB/developer/${datasetId}`);

    mockBuildLogEntry(CubeBuildStatus.Completed);
    const refreshRes = await agent.get(`/en-GB/publish/${datasetId}/build/${buildId}/refresh`);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.text).toContain(`href="/en-GB/developer" class="govuk-button" id="action-button"`);
  });

  test('sends a publisher on to the overview page, or back to the tasklist on failure, when not rebuilding from developer', async () => {
    const endRevisionId = 'end-revision-id';
    mockBackend.use(
      http.get(`${config.backend.url}/dataset/${datasetId}`, () => {
        return HttpResponse.json({ ...completedDataset, draft_revision_id: undefined, end_revision_id: endRevisionId });
      })
    );
    mockRebuild();

    const agent = makeAgent();
    await agent
      .get(`/en-GB/developer/${datasetId}/rebuild/`)
      .set('Referer', `http://localhost/en-GB/publish/${datasetId}/tasklist`);

    mockBuildLogEntry(CubeBuildStatus.Completed);
    const completedRes = await agent.get(`/en-GB/publish/${datasetId}/build/${buildId}/refresh`);
    expect(completedRes.text).toContain(
      `href="/en-GB/publish/${datasetId}/overview" class="govuk-button" id="action-button"`
    );

    mockBuildLogEntry(CubeBuildStatus.Failed);
    const failedRes = await agent.get(`/en-GB/publish/${datasetId}/build/${buildId}/refresh`);
    expect(failedRes.text).toContain(
      `href="/en-GB/publish/${datasetId}/tasklist" class="govuk-button" id="action-button"`
    );
  });

  test('returns a not found error when the dataset cannot be loaded', async () => {
    mockBackend.use(
      http.get(`${config.backend.url}/dataset/${datasetId}`, () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const res = await makeAgent().get(`/en-GB/developer/${datasetId}/rebuild/`);

    expect(res.status).toBe(404);
  });
});
