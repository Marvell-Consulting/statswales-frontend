import path from 'node:path';

import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';

import { PreviewPage } from './pages/preview-page';
import { UploadPage } from './pages/upload-page';
import { users } from '../fixtures/logins';
import { createEmptyDataset } from './helpers/create-empty-dataset';

const config = appConfig();
const baseUrl = config.frontend.url;

// TODO: fix and re-enable this test
test.fixme('Preview page', () => {
  let previewPage: PreviewPage;
  let uploadPage: UploadPage;
  let id: string;

  test.beforeEach(async ({ page }) => {
    previewPage = new PreviewPage(page);
    uploadPage = new UploadPage(page);
  });

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await previewPage.goto(id);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      id = await createEmptyDataset(page, 'Preview spec');
    });

    test.beforeEach(async () => {
      await previewPage.goto(id);
    });

    test('Has a heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Check the data table' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Gwirio’r tabl data' })).toBeVisible();
    });

    test('Displays the uploaded data as a table', async ({ page }) => {
      await expect(page.getByRole('table')).toBeVisible();
      await expect(page.getByText('There are 5 columns and 365 rows in your upload')).toBeVisible();
      await expect(page.locator('th', { hasText: 'Cheese' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Milk' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Region' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Rating' })).toBeVisible();
    });

    test('Can change the number of rows per page', async ({ page }) => {
      await expect(page.getByText('Showing rows 1 – 10 of 365')).toBeVisible();
      const rowsBefore = await page.locator('tbody tr').count();
      expect(rowsBefore).toBe(10);

      await previewPage.pageSize(100);

      await expect(page.getByText('Showing rows 1 – 100 of 365')).toBeVisible();
      const rowsAfter = await page.locator('tbody tr').count();
      expect(rowsAfter).toBe(100);
    });

    // TODO: fix pagination - see SW-350
    test.fixme('Can paginate through the data', async ({ page }) => {
      await expect(page.getByText('Abbaye de Belloc')).toBeVisible();
      await expect(page.getByText('Appenzellar')).toBeVisible();
      await page.getByLabel('Page 2', { exact: true }).click();

      await expect(page.getByText('Ardrahan')).toBeVisible();
      await expect(page.getByText('Bergblumenkase')).toBeVisible();
      await page.getByLabel('Page 3', { exact: true }).click();

      await expect(page.getByText('Bermuda Triangle')).toBeVisible();
      await expect(page.getByText('Bleu de Bocage')).toBeVisible();
      await page.locator('a', { hasText: 'Next' }).click();

      await expect(page.getByText('Bleu de Causses')).toBeVisible();
      await expect(page.getByText('Bondon à la Fleur de Sel')).toBeVisible();
    });

    test('Can choose to upload a different table', async ({ page }) => {
      await previewPage.goto(id);
      await previewPage.cancel();
      expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/upload`);

      await uploadPage.chooseFile(path.join(__dirname, '../sample-csvs/test-data-1.csv'));
      await uploadPage.submit();

      await expect(page.getByRole('heading', { name: 'Check the data table' })).toBeVisible();
      await expect(page.getByText('There are 4 columns and 2 rows in your upload')).toBeVisible();
    });

    test('Can confirm the data is correct', async ({ page }) => {
      await page.locator('button', { hasText: 'Continue' }).click();
      expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/sources`);
    });
  });
});
