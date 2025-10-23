import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { config } from '../../src/shared/config';
import { users } from '../fixtures/logins';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from './helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Move dataset between groups', () => {
  test.describe.configure({ mode: 'default' }); // run tests in this file sequentially

  const title = `move-dataset.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('As editor', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
    });

    test('Is not allowed to move a dataset between groups', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByRole('link', { name: 'Move dataset between groups' })).not.toBeVisible();

      await page.goto(`/en-GB/publish/${datasetId}/move`);
      await expect(page.getByRole('heading', { name: 'You do not have permission to access this page' })).toBeVisible();
    });
  });

  test.describe('As approver', () => {
    test.use({ storageState: users.approver.path });

    test('Is allowed to move a dataset between groups', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await page.getByRole('link', { name: 'Move dataset to another group' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/move`);

      await page.getByText('E2E tests 2', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(page.getByText('Dataset moved to E2E tests 2')).toBeVisible();
    });
  });
});
