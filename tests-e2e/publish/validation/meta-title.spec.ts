import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Title', () => {
  const title = `meta-title.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/title`);
  });

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/title`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
    });

    test.beforeEach(async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/title`);
    });

    test('Has a heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'What is the title of this dataset?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Beth yw teitl y set ddata hon?' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/title`);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await page.getByRole('textbox').fill('');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the input is only whitespace', async ({ page }) => {
        await page.getByRole('textbox').fill('  ');
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });
    });
  });
});
