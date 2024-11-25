import { test, expect } from '@playwright/test';

import { publisherContext } from '../../playwright/.auth/contexts';
import { appConfig } from '../../src/config';

import { TitlePage } from './pages/title-page';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Title page', () => {
  let titlePage: TitlePage;

  test.beforeEach(async ({ page }) => {
    titlePage = new TitlePage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await titlePage.goto();
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: publisherContext });

    test('Has a heading', async ({ page }) => {
      await titlePage.goto();
      await expect(page.getByRole('heading', { name: 'What is the title of this dataset?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await titlePage.goto();
      await page.getByText('Cymraeg').click();
      await page.getByRole('heading', { name: 'Beth yw teitl y set ddata?' }).click();
    });

    test('Can be cancelled and return to homepage', async ({ page }) => {
      await titlePage.goto();
      await titlePage.cancel();
      await expect(page.url()).toBe(`${baseUrl}/en-GB`);
    });

    test.describe('Form', () => {
      test('Displays a validation error when no title is provided', async ({ page }) => {
        await titlePage.goto();
        await titlePage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the title is just whitespace', async ({ page }) => {
        await titlePage.goto();
        await titlePage.enterTitle('   ');
        await titlePage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });

      test('Can provide a title and proceed to upload page', async ({ page }) => {
        await titlePage.goto();
        await titlePage.enterTitle('Dataset Title Test 1');
        await titlePage.submit();
        await expect(page.url()).toContain('/upload');
      });

      test.skip('Displays a validation error when the title already exists', async ({ page }) => {
        // TODO: implement title uniqueness check
        await titlePage.goto();
        await titlePage.enterTitle('Dataset Title Not Unique');
        await titlePage.submit();

        await titlePage.goto();
        await titlePage.enterTitle('Dataset Title Not Unique');
        await titlePage.submit();

        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });
    });
  });
});
