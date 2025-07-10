import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';

import { SummaryPage } from './pages/summary-page';
import { users } from '../fixtures/logins';
import { createEmptyDataset } from './helpers/create-empty-dataset';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Metadata Summary', () => {
  let summaryPage: SummaryPage;
  let id: string;

  test.beforeEach(async ({ page }) => {
    summaryPage = new SummaryPage(page);
  });

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await summaryPage.goto(id);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      id = await createEmptyDataset(page, 'Meta summary spec');
    });

    test('Has a heading', async ({ page }) => {
      await summaryPage.goto(id);
      await expect(
        page.getByRole('heading', { name: 'What is the summary of this dataset and its variables?' })
      ).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await summaryPage.goto(id);
      await page.getByText('Cymraeg').click();
      await expect(
        page.getByRole('heading', { name: `Beth yw'r crynodeb o'r set ddata hon a'i newidynnau?` })
      ).toBeVisible();
    });

    test.describe('Form validation', () => {
      let id: string;

      test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        id = await createEmptyDataset(page, 'Meta summary spec');
      });

      test.beforeEach(async () => {
        await summaryPage.goto(id);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await summaryPage.fillForm('');
        await summaryPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/summary`);
        await expect(page.getByText('Enter the summary of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the input is only whitespace', async ({ page }) => {
        await summaryPage.fillForm('   ');
        await summaryPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/summary`);
        await expect(page.getByText('Enter the summary of this dataset')).toBeVisible();
      });

      test('Can add a summary and return to the tasklist', async ({ page }) => {
        await summaryPage.fillForm('This is a summary.');
        await summaryPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/tasklist`);
      });
    });
  });
});
