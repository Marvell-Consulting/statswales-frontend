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
      await uploadPage.goto(dataset1.id!);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: publisherContext });

    test('Has a heading', async ({ page }) => {
      await page.goto('/en-GB/publish/upload');
      await page.getByRole('textbox', { name: 'title' }).fill('Dataset 1');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByRole('heading', { name: 'Upload the data table' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto('/en-GB/publish/upload');
      await page.getByText('Cymraeg').click();
      await page.getByRole('heading', { name: 'Lanlwytho’r tabl data' }).click();
    });

    test('Can be cancelled', async ({ page }) => {
      await page.goto('/en-GB/publish/title');
      await page.getByRole('link', { name: 'Cancel' }).click();
      await expect(page.url()).toBe('http://localhost:3000/en-GB');
    });

    test.describe('Form', () => {
    });
  });
});
