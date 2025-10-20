import { test, expect } from '@playwright/test';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Topics', () => {
  let datasetId: string;

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/topics`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, 'Meta topics spec');
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
});
