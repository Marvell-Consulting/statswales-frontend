import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';
import { metadataA as dataset, metadataB as datasetB } from '../fixtures/datasets';

import { CollectionPage } from './pages/collection-page';
import { users } from '../fixtures/logins';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Metadata Data Collection', () => {
  let collectionPage: CollectionPage;

  test.beforeEach(async ({ page }) => {
    collectionPage = new CollectionPage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await collectionPage.goto(dataset.id);
      await expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test('Has a heading', async ({ page }) => {
      await collectionPage.goto(dataset.id);
      await expect(page.getByRole('heading', { name: 'How was the data collected or calculated?' })).toBeVisible();
    });

    test.fixme('Can switch to Welsh', async ({ page }) => {
      // TODO: waiting on translations
      await collectionPage.goto(dataset.id);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: '' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async () => {
        await collectionPage.goto(dataset.id);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await collectionPage.fillForm('');
        await collectionPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/collection`);
        await expect(page.getByText('Enter how the data was collected or calculated')).toBeVisible();
      });

      test('Displays a validation error when the input is only whitespace', async ({ page }) => {
        await collectionPage.fillForm('   ');
        await collectionPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/collection`);
        await expect(page.getByText('Enter how the data was collected or calculated')).toBeVisible();
      });
    });

    test.describe('Form validation', () => {
      test.beforeEach(async () => {
        await collectionPage.goto(datasetB.id);
      });

      test('Can add info about data collection and return to the tasklist', async ({ page }) => {
        await collectionPage.fillForm('This is info about collection.');
        await collectionPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetB.id}/tasklist`);
      });
    });
  });
});
