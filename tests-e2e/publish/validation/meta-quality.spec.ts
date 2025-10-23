import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Quality', () => {
  const title = `meta-quality.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/quality`);
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
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/quality`);
      await expect(
        page.getByRole('heading', { name: 'What is the statistical quality of this dataset?' })
      ).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/quality`);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Beth yw ansawdd ystadegol y set ddata hon?' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/quality`);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/quality`);
        await expect(page.getByText('Enter the statistical quality of this dataset').first()).toBeVisible();
        await expect(
          page.getByText('Select whether any rounding has been applied to the data values').first()
        ).toBeVisible();
      });

      test('Displays a validation error when the quality input is only whitespace', async ({ page }) => {
        await page.getByRole('textbox').fill('   ');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/quality`);
        await expect(page.getByText('Enter the statistical quality of this dataset').first()).toBeVisible();
      });

      test('Displays a validation error when rounding applied is not specified', async ({ page }) => {
        await page.getByRole('textbox').fill('This is info about data quality.');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/quality`);
        await expect(
          page.getByText('Select whether any rounding has been applied to the data values').first()
        ).toBeVisible();
      });

      test('Displays a validation error when rounding applied but rounding description missing', async ({ page }) => {
        await page.getByRole('textbox').fill('This is info about data quality.');
        await page.getByText('Yes', { exact: true }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/quality`);
        await expect(page.getByText('Enter what rounding has been applied to the data values').first()).toBeVisible();
      });
    });
  });
});
