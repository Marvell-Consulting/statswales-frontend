import { test, expect } from '../../fixtures/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Quality', () => {
  const title = `meta-quality.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('Authed as a publisher', () => {
    test.use({ role: 'publisher' });

    test.beforeAll(async ({ browser, workerUsers }) => {
      const context = await browser.newContext({ storageState: workerUsers.publisher.path });
      const page = await context.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
      await page.close();
      await context.close();
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

  test.describe('Not authed', () => {
    // role defaults to null → unauthenticated (no cookies)
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/quality`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });
});
