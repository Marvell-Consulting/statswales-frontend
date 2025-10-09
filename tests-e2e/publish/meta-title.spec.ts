import { test, expect } from '@playwright/test';

import { config } from '../../src/shared/config';

import { TitlePage } from './pages/title-page';
import { users } from '../fixtures/logins';
import { createEmptyDataset } from './helpers/create-empty-dataset';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Title', () => {
  let titlePage: TitlePage;
  let id: string;

  test.beforeEach(async ({ page }) => {
    titlePage = new TitlePage(page);
  });

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await titlePage.goto(id);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      id = await createEmptyDataset(page, 'Meta title spec');
    });

    test.beforeEach(async () => {
      await titlePage.goto(id);
    });

    test('Has a heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'What is the title of this dataset?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Beth yw teitl y set ddata hon?' })).toBeVisible();
    });

    test.describe('Form', () => {
      let id: string;

      test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        id = await createEmptyDataset(page, 'Meta title spec');
      });

      test.beforeEach(async () => {
        await titlePage.goto(id);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await titlePage.fillForm('');
        await titlePage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the input is only whitespace', async ({ page }) => {
        await titlePage.fillForm('   ');
        await titlePage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });

      test('Can update the title and return to the tasklist', async ({ page }) => {
        await titlePage.fillForm('Test - Metadata Updated');
        await titlePage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/tasklist`);
      });
    });
  });
});
