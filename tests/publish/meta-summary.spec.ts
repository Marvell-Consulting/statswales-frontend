import { test, expect } from '@playwright/test';

import { publisherContext } from '../../playwright/.auth/contexts';
import { appConfig } from '../../src/config';
import { metadata as dataset } from '../fixtures/datasets';

import { SummaryPage } from './pages/summary-page';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Metadata Summary', () => {
  let summaryPage: SummaryPage;

  test.beforeEach(async ({ page }) => {
    summaryPage = new SummaryPage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await summaryPage.goto(dataset.id);
      await expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: publisherContext });

    test.beforeEach(async () => {
      await summaryPage.goto(dataset.id);
    });

    test('Has a heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'What is the summary of this dataset?' })).toBeVisible();
    });

    test.fixme('Can switch to Welsh', async ({ page }) => {
      // TODO: waiting on translations
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: '' })).toBeVisible();
    });

    test('Can be cancelled and return to tasklist', async ({ page }) => {
      await summaryPage.cancel();
      await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/tasklist`);
    });

    test.describe('Form', () => {
      test('Displays a validation error when no summary is provided', async ({ page }) => {
        await summaryPage.fillForm('');
        await summaryPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/summary`);
        await expect(page.getByText('Enter the summary of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the summary is just whitespace', async ({ page }) => {
        await summaryPage.fillForm('   ');
        await summaryPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/summary`);
        await expect(page.getByText('Enter the summary of this dataset')).toBeVisible();
      });

      test('Can add a summary and return to the tasklist', async ({ page }) => {
        await summaryPage.fillForm('This is a summary.');
        await summaryPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/tasklist`);
      });
    });
  });
});
