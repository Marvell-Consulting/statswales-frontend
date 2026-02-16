import { test, expect } from '../../fixtures/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Topics', () => {
  const title = `meta-topics.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('Authed as a publisher', () => {
    test.use({ role: 'publisher' });

    test.beforeAll(async ({ browser, workerUsers }) => {
      const context = await browser.newContext({ storageState: workerUsers.publisher.path });
      const page = await context.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
    });

    test('Has a heading', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/topics`);
      await expect(page.getByRole('heading', { name: 'Which topics are relevant to this dataset?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/topics`);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: `Pa bynciau sy’n berthnasol i’r set ddata hon?` })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/topics`);
      });

      test('Displays a validation error when no selection is made', async ({ page }) => {
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/topics`);
        await expect(page.getByText('Select which topics are relevant to this dataset').first()).toBeVisible();
      });
    });
  });

  test.describe('Not authed', () => {
    // role defaults to null → unauthenticated (no cookies)
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/topics`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });
});
