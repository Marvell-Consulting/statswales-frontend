import { test, expect } from '@playwright/test';

import { config } from '../../src/shared/config';

import { TopicsPage } from './pages/topics-page';
import { users } from '../fixtures/logins';
import { createEmptyDataset } from './helpers/create-empty-dataset';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Topics', () => {
  let topicsPage: TopicsPage;
  let id: string;

  test.beforeEach(async ({ page }) => {
    topicsPage = new TopicsPage(page);
  });

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await topicsPage.goto(id);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      id = await createEmptyDataset(page, 'Meta topics spec');
    });

    test('Has a heading', async ({ page }) => {
      await topicsPage.goto(id);
      await expect(page.getByRole('heading', { name: 'Which topics are relevant to this dataset?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await topicsPage.goto(id);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: `Pa bynciau sy’n berthnasol i’r set ddata hon?` })).toBeVisible();
    });

    test.describe('Form validation', () => {
      let id: string;
      test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        id = await createEmptyDataset(page, 'Meta topics spec');
      });

      test.beforeEach(async () => {
        await topicsPage.goto(id);
      });

      test('Displays a validation error when no selection is made', async ({ page }) => {
        await topicsPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/topics`);
        await expect(page.getByText('Select which topics are relevant to this dataset').first()).toBeVisible();
      });

      test('Can select dataset topics then return to the tasklist', async ({ page }) => {
        await topicsPage.fillForm(['Finance and tax', 'Council tax']);
        await topicsPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/tasklist`);
      });
    });
  });
});
