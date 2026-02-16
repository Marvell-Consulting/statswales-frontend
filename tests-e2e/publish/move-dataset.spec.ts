import { test, expect } from '../fixtures/test';
import { nanoid } from 'nanoid';

import { config } from '../../src/shared/config';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from './helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Move dataset between groups', () => {
  const title = `move-dataset.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('As editor', () => {
    test.use({ role: 'publisher' });

    test.beforeAll(async ({ browser, workerUsers }) => {
      const context = await browser.newContext({ storageState: workerUsers.publisher.path });
      const page = await context.newPage();
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
    test.use({ role: 'approver' });

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
