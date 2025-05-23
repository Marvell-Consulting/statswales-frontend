import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';
import { metadataA as dataset, metadataB as datasetB } from '../fixtures/datasets';

import { DesignationPage } from './pages/designation-page';
import { users } from '../fixtures/logins';
import { createEmptyDataset } from './helpers/create-empty-dataset';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Metadata Designation', () => {
  let designationPage: DesignationPage;
  let id: string;

  test.beforeEach(async ({ page }) => {
    designationPage = new DesignationPage(page);
  });

  // test.describe('Not authed', () => {
  //   test('Redirects to login page when not authenticated', async ({ page }) => {
  //     await designationPage.goto(id);
  //     await expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
  //   });
  // });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      id = await createEmptyDataset(page, 'Meta designation spec');
    });

    test('Has a heading', async ({ page }) => {
      await designationPage.goto(id);
      await expect(page.getByRole('heading', { name: 'How is this dataset designated?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await designationPage.goto(id);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Beth yw dynodiad y set ddata hon?' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async () => {
        // Only use metadata A dataset for failed form validation - once successfully saved, tests for a missing
        // designation radio selection will fail as it is populated with the saved value from the previous submission
        await designationPage.goto(id);
      });

      test('Displays a validation error when no selection is made', async ({ page }) => {
        await designationPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/designation`);
        await expect(page.getByText('Select how this dataset is designated').first()).toBeVisible();
      });
    });

    test.describe('Form success', () => {
      test.beforeEach(async () => {
        // using metadata B dataset for successful form submission
        await designationPage.goto(datasetB.id);
      });

      test('Can select dataset designation then return to the tasklist', async ({ page }) => {
        await designationPage.fillForm('Accredited official statistics');
        await designationPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetB.id}/tasklist`);
      });
    });
  });
});
