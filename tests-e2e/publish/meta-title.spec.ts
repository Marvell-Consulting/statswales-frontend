import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';
import { metadataA as datasetA } from '../fixtures/datasets';

import { TitlePage } from './pages/title-page';
import { users } from '../fixtures/logins';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Metadata Title', () => {
  let titlePage: TitlePage;

  test.beforeEach(async ({ page }) => {
    titlePage = new TitlePage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await titlePage.goto(datasetA.id);
      await expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeEach(async () => {
      await titlePage.goto(datasetA.id);
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
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetA.id}/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the input is only whitespace', async ({ page }) => {
        await titlePage.fillForm('   ');
        await titlePage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetA.id}/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });

      test('Can update the title and return to the tasklist', async ({ page }) => {
        await titlePage.fillForm('Test - Metadata Updated');
        await titlePage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetA.id}/tasklist`);
      });

      test.fixme('Displays a validation error when the title already exists', async ({ page }) => {
        // TODO: implement title uniqueness check
        await titlePage.fillForm('Test - Metadata B');
        await titlePage.submit();

        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });
    });
  });
});
