import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';
import { metadataA as dataset, metadataB as datasetB } from '../fixtures/datasets';

import { TopicsPage } from './pages/topics-page';
import { users } from '../fixtures/logins';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Metadata Topics', () => {
  let topicsPage: TopicsPage;

  test.beforeEach(async ({ page }) => {
    topicsPage = new TopicsPage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await topicsPage.goto(dataset.id);
      await expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test('Has a heading', async ({ page }) => {
      await topicsPage.goto(dataset.id);
      await expect(page.getByRole('heading', { name: 'Which topics are relevant to this dataset?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await topicsPage.goto(dataset.id);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: `Pa faterion sy'n berthnasol i'r set ddata hon?` })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async () => {
        // Only use metadata A dataset for failed form validation - once successfully saved, tests for missing
        // topics selection will fail as it is populated with the saved values from the previous submission
        await topicsPage.goto(dataset.id);
      });

      test('Displays a validation error when no selection is made', async ({ page }) => {
        await topicsPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/topics`);
        await expect(page.getByText('Select which topics are relevant to this dataset').first()).toBeVisible();
      });
    });

    test.describe('Form success', () => {
      test.beforeEach(async () => {
        // using metadata B dataset for successful form submission
        await topicsPage.goto(datasetB.id);
      });

      test('Can select dataset designation then return to the tasklist', async ({ page }) => {
        await topicsPage.fillForm(['Finance and tax', 'Council tax']);
        await topicsPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetB.id}/tasklist`);
      });
    });
  });
});
