import { test, expect } from '@playwright/test';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Summary', () => {
  let datasetId: string;

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, 'Meta summary spec');
    });

    test('Has a heading', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
      await expect(
        page.getByRole('heading', { name: 'What is the summary of this dataset and its variables?' })
      ).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
      await page.getByText('Cymraeg').click();
      await expect(
        page.getByRole('heading', { name: `Beth yw’r crynodeb o’r set ddata hon a’i newidynnau?` })
      ).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Summary' }).fill('');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
        await expect(page.getByText('Enter the summary of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the input is only whitespace', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Summary' }).fill('   ');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
        await expect(page.getByText('Enter the summary of this dataset')).toBeVisible();
      });
    });
  });
});
