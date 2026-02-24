import { nanoid } from 'nanoid';

import { test, expect } from '../../fixtures/test';

import { config } from '../../../src/shared/config';
import {
  updateAddNewDataUpload,
  provideDatasetTitle,
  publishMinimalDataset,
  selectUserGroup,
  startNewDataset,
  uploadInvalidDataTable
} from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Upload page', () => {
  const title = `data-upload.spec - ${nanoid(5)}`;
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
        await uploadInvalidDataTable(page, 'invalid/only-1-col.csv');
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/upload`);
        await expect(page.getByText('errors.unknown_error')).toBeVisible(); // TODO: fix this error message
      });
    });
  });

  test.describe('Not authed', () => {
    // role defaults to null → unauthenticated (no cookies)
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/upload`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });
});

test.describe('Fact table validation errors on update', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ role: 'solo' });

  const title = `update-fact-validation - ${nanoid(5)}`;
  let datasetId: string;

  test.beforeAll(async ({ browser, workerUsers }, testInfo) => {
    test.setTimeout(120000);
    const context = await browser.newContext({ storageState: workerUsers.solo.path });
    const page = await context.newPage();
    datasetId = await publishMinimalDataset(page, testInfo, title);
    await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
    await page.getByRole('link', { name: 'Update this dataset' }).click();
    await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
    await page.close();
    await context.close();
  });

  test('Validates for duplicate facts', async ({ page }) => {
    await updateAddNewDataUpload(page, datasetId);
    await uploadInvalidDataTable(page, 'invalid/update-dupe-fact.csv');
    await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/upload/validation-errors`);
    await expect(page.getByRole('heading', { name: 'Data table has 2 duplicate facts' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Replace the data table' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Change what each column contains' })).not.toBeVisible();
  });

  test('Validates for incomplete facts', async ({ page }) => {
    await updateAddNewDataUpload(page, datasetId);
    await uploadInvalidDataTable(page, 'invalid/update-incomplete-fact.csv');
    await expect(page.getByText('There is a problem')).toBeVisible();
  });

  test('Validates for bad note codes', async ({ page }) => {
    await updateAddNewDataUpload(page, datasetId);
    await uploadInvalidDataTable(page, 'invalid/update-bad-note-codes.csv');
    await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/upload/validation-errors`);
    await expect(
      page.getByRole('heading', { name: 'Date table has 1 instances of unrecognised note codes' })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Replace the data table' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Change what each column contains' })).not.toBeVisible();
  });
});
