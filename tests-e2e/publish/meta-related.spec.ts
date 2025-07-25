import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/shared/config';

import { RelatedLinksPage } from './pages/related-page';
import { users } from '../fixtures/logins';
import { createEmptyDataset } from './helpers/create-empty-dataset';

const config = appConfig();
const baseUrl = config.frontend.publisher.url;

test.describe.configure({ mode: 'serial' }); // tests in this file must be performed in order to avoid test failures

test.describe('Metadata Related Links', () => {
  let relatedPage: RelatedLinksPage;
  let id: string;

  test.beforeEach(async ({ page }) => {
    relatedPage = new RelatedLinksPage(page);
  });

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await relatedPage.goto(id);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      id = await createEmptyDataset(page, 'Meta related spec');
    });

    test('Has a heading', async ({ page }) => {
      await relatedPage.goto(id);
      await relatedPage.removeAllLinks();
      await expect(page.getByRole('heading', { name: 'Add a link to a report' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await relatedPage.goto(id);
      await relatedPage.removeAllLinks();
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Ychwanegu dolen i adroddiad' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async () => {
        await relatedPage.goto(id);
        await relatedPage.removeAllLinks();
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await relatedPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/related`);
        await expect(page.getByText('Enter the link URL for a related report').first()).toBeVisible();
        await expect(
          page.getByText('Enter the link text to appear on the webpage for a related report').first()
        ).toBeVisible();
      });

      test('Displays a validation error when an invalid URL is provided', async ({ page }) => {
        await relatedPage.fillForm('Not a URL', 'Some label');
        await relatedPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/related`);
        await expect(page.getByText('Enter the link URL in the correct format').first()).toBeVisible();
      });

      test('Can successfully add a related link', async ({ page }) => {
        await relatedPage.fillForm('http://example.com/1', 'Link 1');
        await relatedPage.submit();

        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/related`);
        await expect(page.getByRole('heading', { name: 'Report links added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 1' })).toBeVisible();
      });

      test('Displays a validation error when no option chosen for add another link', async ({ page }) => {
        await relatedPage.fillForm('http://example.com/1', 'Link 1');
        await relatedPage.submit();

        await relatedPage.submit();
        await expect(page.getByText('Select yes if you need to add a link to another report')).toBeVisible();
      });
    });

    test.describe('Form success', () => {
      let id: string;

      test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        id = await createEmptyDataset(page, 'Meta related spec');
      });

      test.beforeEach(async () => {
        await relatedPage.goto(id);
      });

      test('Can successfully add multiple related links', async ({ page }) => {
        await relatedPage.removeAllLinks();

        await relatedPage.fillForm('http://example.com/1', 'Link 1');
        await relatedPage.submit();

        await relatedPage.addAnotherLink(true);
        await relatedPage.submit();

        await relatedPage.fillForm('http://example.com/2', 'Link 2');
        await relatedPage.submit();

        await relatedPage.addAnotherLink(true);
        await relatedPage.submit();

        await relatedPage.fillForm('http://example.com/3', 'Link 3');
        await relatedPage.submit();

        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/related`);
        await expect(page.getByRole('heading', { name: 'Report links added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 1' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 2' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 3' })).toBeVisible();
      });

      test('Can remove a single related link', async ({ page }) => {
        const row = page.getByRole('row', { name: 'Link 2' });
        await row.getByRole('link', { name: 'Remove' }).click();

        await expect(page.getByRole('heading', { name: 'Report links added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 1' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 2' })).not.toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 3' })).toBeVisible();
      });
    });
  });
});
