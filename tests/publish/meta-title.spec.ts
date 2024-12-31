import { test, expect } from '@playwright/test';

import { publisherContext } from '../../playwright/.auth/contexts';
import { appConfig } from '../../src/config';
import { metadata as dataset } from '../fixtures/datasets';

import { TitlePage } from './pages/title-page';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Metadata Title', () => {
  let titlePage: TitlePage;

  test.beforeEach(async ({ page }) => {
    titlePage = new TitlePage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await titlePage.goto(dataset.id);
      await expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: publisherContext });

    test.beforeEach(async () => {
      await titlePage.goto(dataset.id);
    });

    test('Has a heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'What is the title of this dataset?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Beth yw teitl y set ddata?' })).toBeVisible();
    });

    test.describe('Form', () => {
      test('Displays a validation error when no input is provided', async ({ page }) => {
        await titlePage.fillForm('');
        await titlePage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the input is only whitespace', async ({ page }) => {
        await titlePage.fillForm('   ');
        await titlePage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });

      test('Can update the title and return to the tasklist', async ({ page }) => {
        await titlePage.fillForm('Dataset Title Test 1');
        await titlePage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/tasklist`);
      });

      test.fixme('Displays a validation error when the title already exists', async ({ page }) => {
        // TODO: implement title uniqueness check
        await titlePage.fillForm('Dataset Title Not Unique');
        await titlePage.submit();

        await titlePage.goto();
        await titlePage.fillForm('Dataset Title Not Unique');
        await titlePage.submit();

        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });
    });
  });
});
