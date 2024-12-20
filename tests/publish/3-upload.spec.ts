import path from 'node:path';

import { test, expect } from '@playwright/test';

import { publisherContext } from '../../playwright/.auth/contexts';
import { appConfig } from '../../src/config';
import { dataset1 } from '../fixtures/datasets';

import { TitlePage } from './pages/title-page';
import { UploadPage } from './pages/upload-page';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Upload page', () => {
  let titlePage: TitlePage;
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    titlePage = new TitlePage(page);
    uploadPage = new UploadPage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await uploadPage.goto(dataset1.id);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: publisherContext });

    test('Has a heading', async ({ page }) => {
      await uploadPage.goto(dataset1.id);
      await expect(page.getByRole('heading', { name: 'Upload the data table' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await uploadPage.goto(dataset1.id);
      await page.getByText('Cymraeg').click();
      await page.getByRole('heading', { name: 'Lanlwytho’r tabl data' }).click();
    });

    test.describe('Form', () => {
      test('Displays a validation error when no file is provided', async ({ page }) => {
        await uploadPage.goto(dataset1.id);
        await uploadPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset1.id}/upload`);
        await expect(page.getByText('Select a data table')).toBeVisible();
      });

      test('Displays a validation error when an invalid file is provided', async ({ page }) => {
        await uploadPage.goto(dataset1.id);
        await uploadPage.chooseFile(path.join(__dirname, '../sample-csvs/invalid-1-col.csv'));
        await uploadPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset1.id}/upload`);
        await expect(page.getByText('The selected file could not be uploaded – try again')).toBeVisible();
      });

      test('Redirects to the preview page when a valid file is provided', async ({ page }) => {
        await uploadPage.goto(dataset1.id);
        await uploadPage.chooseFile(path.join(__dirname, '../sample-csvs/test-data-1.csv'));
        await uploadPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset1.id}/preview`);
      });
    });
  });
});
