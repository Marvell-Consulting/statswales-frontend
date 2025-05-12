import path from 'node:path';

import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';
import { upload as dataset } from '../fixtures/datasets';

import { UploadPage } from './pages/upload-page';
import { users } from '../fixtures/logins';

const config = appConfig();
const baseUrl = config.frontend.url;

// TODO: fix and re-enable this test
test.fixme('Upload page', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await uploadPage.goto(dataset.id);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeEach(async () => {
      await uploadPage.goto(dataset.id);
    });

    test('Has a heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Upload the data table' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: "Lanlwytho'r tabl data" })).toBeVisible();
    });

    test.describe('Form', () => {
      test('Displays a validation error when no file is provided', async ({ page }) => {
        await uploadPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/upload`);
        await expect(page.getByText('Select a data table')).toBeVisible();
      });

      test('Displays a validation error when an invalid file is provided', async ({ page }) => {
        await uploadPage.chooseFile(path.join(__dirname, '../sample-csvs/invalid-1-col.csv'));
        await uploadPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/upload`);
        await expect(page.getByText('The selected file could not be uploaded – try again')).toBeVisible();
      });

      test('Redirects to the preview page when a valid file is provided', async ({ page }) => {
        await uploadPage.chooseFile(path.join(__dirname, '../sample-csvs/test-data-1.csv'));
        await uploadPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/preview`);
      });
    });
  });
});
