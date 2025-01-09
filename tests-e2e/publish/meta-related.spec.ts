import { test, expect } from '@playwright/test';

import { publisherContext } from '../../playwright/.auth/contexts';
import { appConfig } from '../../src/config';
import { metadataA as dataset, metadataB as datasetB } from '../fixtures/datasets';

import { RelatedLinksPage } from './pages/related-page';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe.configure({ mode: 'serial' }); // tests in this file must be performed in order to avoid test failures

test.describe('Metadata Related Links', () => {
  let relatedPage: RelatedLinksPage;

  test.beforeEach(async ({ page }) => {
    relatedPage = new RelatedLinksPage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await relatedPage.goto(dataset.id);
      await expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: publisherContext });

    test('Has a heading', async ({ page }) => {
      await relatedPage.goto(dataset.id);
      await expect(page.getByRole('heading', { name: 'Add a link to a report' })).toBeVisible();
    });

    test.fixme('Can switch to Welsh', async ({ page }) => {
      // TODO: waiting on translations
      await relatedPage.goto(dataset.id);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: '' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async ({ page }) => {
        await relatedPage.goto(dataset.id);

        // clean up any existing links before each test
        while (await page.getByRole('link', { name: 'Remove' }).first().isVisible()) {
          await page.getByRole('link', { name: 'Remove' }).first().click();
        }
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await relatedPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/related`);
        await expect(page.getByText('Enter the link URL for a related report').first()).toBeVisible();
        await expect(
          page.getByText('Enter the link text to appear on the webpage for a related report').first()
        ).toBeVisible();
      });

      test('Displays a validation error when an invalid URL is provided', async ({ page }) => {
        await relatedPage.fillForm('Not a URL', 'Some label');
        await relatedPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/related`);
        await expect(page.getByText('Enter the link URL in the correct format').first()).toBeVisible();
      });

      test('Can successfully add a related link', async ({ page }) => {
        await relatedPage.fillForm('http://example.com/1', 'Link 1');
        await relatedPage.submit();

        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/related`);
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
      test.beforeEach(async () => {
        await relatedPage.goto(datasetB.id);
      });

      test('Can successfully add multiple related links', async ({ page }) => {
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

        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetB.id}/related`);
        await expect(page.getByRole('heading', { name: 'Report links added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 1' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 2' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 3' })).toBeVisible();
      });

      test('Can remove a single related link', async ({ page }) => {
        const row = await page.getByRole('row', { name: 'Link 2' });
        await row.getByRole('link', { name: 'Remove' }).click();

        await expect(page.getByRole('heading', { name: 'Report links added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 1' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 2' })).not.toBeVisible();
        await expect(page.getByRole('cell', { name: 'Link 3' })).toBeVisible();
      });
    });
  });
});
