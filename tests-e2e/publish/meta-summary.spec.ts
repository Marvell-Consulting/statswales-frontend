import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';
import { metadataA as dataset, metadataB as datasetB } from '../fixtures/datasets';

import { SummaryPage } from './pages/summary-page';
import { users } from '../fixtures/logins';

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
    test.use({ storageState: users.publisher.path });

    test('Has a heading', async ({ page }) => {
      await summaryPage.goto(dataset.id);
      await expect(page.getByRole('heading', { name: 'What is the summary of this dataset?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await summaryPage.goto(dataset.id);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: `Beth yw'r crynodeb o'r set ddata hon?` })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async () => {
        // Only use metadata A dataset for failed form validation
        await summaryPage.goto(dataset.id);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await summaryPage.fillForm('');
        await summaryPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/summary`);
        await expect(page.getByText('Enter the summary of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the input is only whitespace', async ({ page }) => {
        await summaryPage.fillForm('   ');
        await summaryPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/summary`);
        await expect(page.getByText('Enter the summary of this dataset')).toBeVisible();
      });
    });

    test.describe('Form success', () => {
      test.beforeEach(async () => {
        // Use metadata B for successful form submission
        await summaryPage.goto(datasetB.id);
      });

      test('Can add a summary and return to the tasklist', async ({ page }) => {
        await summaryPage.fillForm('This is a summary.');
        await summaryPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetB.id}/tasklist`);
      });
    });
  });
});
