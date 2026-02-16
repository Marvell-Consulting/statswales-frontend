import { test, expect } from '../../fixtures/test';
import { Page } from '@playwright/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Related Links', () => {
  const title = `meta-related.spec - ${nanoid(5)}`;
  let datasetId: string;

  async function removeAllLinks(page: Page) {
    while (await page.getByRole('link', { name: 'Remove' }).first().isVisible()) {
      await page.getByRole('link', { name: 'Remove' }).first().click();
    }
  }

  test.describe('Authed as a publisher', () => {
    test.use({ role: 'publisher' });

    test.beforeAll(async ({ browser, workerUsers }) => {
      const context = await browser.newContext({ storageState: workerUsers.publisher.path });
      const page = await context.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
      await page.close();
      await context.close();
    });

    test('Has a heading', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/related`);
      await removeAllLinks(page);
      await expect(page.getByRole('heading', { name: 'Add a link to a report' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/related`);
      await removeAllLinks(page);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Ychwanegu dolen i adroddiad' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/related`);
        await removeAllLinks(page);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/related`);
        await expect(page.getByText('Enter the link URL for a related report').first()).toBeVisible();
        await expect(
          page.getByText('Enter the link text to appear on the webpage for a related report').first()
        ).toBeVisible();
      });

      test('Displays a validation error when an invalid URL is provided', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Link URL' }).fill('Not a URL');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/related`);
        await expect(page.getByText('Enter the link URL in the correct format').first()).toBeVisible();
      });

      test('Can successfully add a related link', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Link URL' }).fill('http://example.com/1');
        await page.getByRole('textbox', { name: 'Link text' }).fill('Link 1');
        await page.getByRole('button', { name: 'Continue' }).click();

        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/related`);
        await expect(page.getByRole('heading', { name: 'Report links added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 1' })).toBeVisible();
      });

      test('Displays a validation error when no option chosen for add another link', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Link URL' }).fill('http://example.com/1');
        await page.getByRole('textbox', { name: 'Link text' }).fill('Link 1');
        await page.getByRole('button', { name: 'Continue' }).click();

        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.getByText('Select yes if you need to add a link to another report')).toBeVisible();
      });
    });
  });

  test.describe('Not authed', () => {
    // role defaults to null → unauthenticated (no cookies)
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/related`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });
});
