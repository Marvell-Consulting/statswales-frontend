import { test as base, expect, BrowserContext, Page } from '@playwright/test';

import { getUsersForWorker, WorkerUsers, TestRole } from './logins';

// ── Custom options & fixtures ───────────────────────────────────────────

type RoleOption = TestRole | 'admin' | null;

type TestFixtures = {
  /** Set the role for this describe / test block. Resolves storageState automatically. */
  role: RoleOption;
  /** Returns an authenticated { context, page } for the given role, using this worker's assigned user. */
  loginAs: (role: TestRole | 'admin') => Promise<{ context: BrowserContext; page: Page }>;
};

type WorkerFixtures = {
  /** The users assigned to this worker (based on parallelIndex). Available in beforeAll and tests. */
  workerUsers: WorkerUsers;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // ── Worker-scoped: resolved once per worker ───────────────────────────

  workerUsers: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const users = getUsersForWorker(workerInfo.parallelIndex);
      await use(users);
    },
    { scope: 'worker' }
  ],

  // ── Test option: which role to authenticate as ────────────────────────

  role: [null, { option: true }],

  // ── Override storageState based on role option ─────────────────────────

  storageState: async ({ role, workerUsers }, use) => {
    if (role === null) {
      // Unauthenticated
      await use({ cookies: [], origins: [] });
    } else {
      await use(workerUsers[role].path);
    }
  },

  // ── loginAs fixture: create a new context authenticated as a role ─────

  loginAs: async ({ browser, workerUsers }, use) => {
    const contexts: BrowserContext[] = [];

    const fn = async (role: TestRole | 'admin') => {
      const user = workerUsers[role];
      const context = await browser.newContext({ storageState: user.path });
      contexts.push(context);
      const page = await context.newPage();
      return { context, page };
    };

    await use(fn);

    // Cleanup all contexts created during the test
    for (const ctx of contexts) {
      await ctx.close();
    }
  }
});

export { expect };
