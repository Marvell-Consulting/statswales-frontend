import { test as base, expect, BrowserContext, Page } from '@playwright/test';

import { pools, publishers, approvers, solos, WorkerUsers, TestRole, TestUser } from './logins';
import { acquireUser, releaseUser } from './user-pool';

// ── Custom options & fixtures ───────────────────────────────────────────

type RoleOption = TestRole | null;

type TestFixtures = {
  /** Set the role for this describe / test block. Resolves storageState automatically. */
  role: RoleOption;
  /** Returns an authenticated { context, page } for the given role, using this worker's assigned user. */
  loginAs: (role: TestRole) => Promise<{ context: BrowserContext; page: Page }>;
};

type WorkerFixtures = {
  /** The users assigned to this worker. Available in beforeAll and tests. */
  workerUsers: WorkerUsers;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // ── Worker-scoped: resolved once per worker ───────────────────────────

  workerUsers: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const publisher = acquireUser(publishers);
      const approver = acquireUser(approvers);
      const solo = acquireUser(solos);
      const users: WorkerUsers = { publisher, approver, solo };

      await use(users);

      releaseUser(publisher);
      releaseUser(approver);
      releaseUser(solo);
    },
    { scope: 'worker' }
  ],

  // ── Test option: which role to authenticate as ────────────────────────

  role: [null, { option: true }],

  // ── Override storageState based on role option ─────────────────────────

  storageState: async ({ role, workerUsers }, use) => {
    if (role === null) {
      await use({ cookies: [], origins: [] });
    } else {
      const user = workerUsers[role];
      if (!user) {
        throw new Error(`No ${role} user assigned to this worker. Use loginAs('${role}') instead.`);
      }
      await use(user.path);
    }
  },

  // ── loginAs fixture: create a new context authenticated as a role ─────

  loginAs: async ({ browser, workerUsers }, use) => {
    const contexts: BrowserContext[] = [];
    const onDemandUsers: TestUser[] = [];

    const fn = async (role: TestRole) => {
      let user = workerUsers[role];

      // Roles not eagerly acquired (admin, dev) are acquired on demand
      if (!user) {
        user = acquireUser(pools[role]);
        workerUsers[role] = user;
        onDemandUsers.push(user);
      }

      const context = await browser.newContext({ storageState: user.path });
      contexts.push(context);
      const page = await context.newPage();
      return { context, page };
    };

    await use(fn);

    for (const ctx of contexts) {
      await ctx.close();
    }

    for (const user of onDemandUsers) {
      releaseUser(user);
    }
  }
});

export { expect };
