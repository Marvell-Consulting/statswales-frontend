import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata - Data collection', () => {
  const title = `meta-collection.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/collection`);
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

    test('Has a heading', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/collection`);
      await expect(page.getByRole('heading', { name: 'How was the data collected or calculated?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/collection`);
      await page.getByText('Cymraeg').click();
      await expect(
        page.getByRole('heading', { name: 'Sut oedd y data wedi cael ei gasglu neu ei gyfrifo?' })
      ).toBeVisible();
    });

    test.describe('Form validation', () => {
      test('Displays a validation error when no input is provided', async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/collection`);
        await page.getByRole('textbox').fill('');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/collection`);
        await expect(page.getByText('Enter how the data was collected or calculated')).toBeVisible();
      });

      test('Displays a validation error when the input is only whitespace', async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/collection`);
        await page.getByRole('textbox').fill('  ');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/collection`);
        await expect(page.getByText('Enter how the data was collected or calculated')).toBeVisible();
      });
    });
  });
});
