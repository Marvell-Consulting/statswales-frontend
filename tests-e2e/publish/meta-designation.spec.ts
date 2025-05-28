import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';

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

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await designationPage.goto(id);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

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

    test.describe('Form success', () => {
      let id: string;
      test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        id = await createEmptyDataset(page, 'Meta designation spec');
      });

      test.beforeEach(async () => {
        await designationPage.goto(id);
      });

      test('Displays a validation error when no selection is made', async ({ page }) => {
        await designationPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/designation`);
        await expect(page.getByText('Select how this dataset is designated').first()).toBeVisible();
      });

      test('Can select dataset designation then return to the tasklist', async ({ page }) => {
        await designationPage.fillForm('Accredited official statistics');
        await designationPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/tasklist`);
      });
    });
  });
});
