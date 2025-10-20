import path from 'node:path';

import { test, expect } from '@playwright/test';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';
import { provideDatasetTitle, selectUserGroup, startNewDataset } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Upload page', () => {
  let datasetId: string;

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/upload`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, 'Upload spec');
    });

    test.beforeEach(async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/upload`);
    });

    test('Has a heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Upload the data table' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Lanlwytho’r tabl data' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test('Displays a validation error when no file is provided', async ({ page }) => {
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/upload`);
        await expect(page.getByText('Select a data table')).toBeVisible();
      });

      test('Displays a validation error when an invalid file is provided', async ({ page }) => {
        const filePath = path.join(__dirname, '../../sample-csvs/invalid/only-1-col.csv');
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.locator('input[name="csv"]').click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(filePath);
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/upload`);
        await expect(page.getByText('errors.unknown_error')).toBeVisible(); // TODO: fix this error message
      });
    });
  });
});
