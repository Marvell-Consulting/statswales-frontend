import { expect, Browser, Page } from '@playwright/test';
import { CONSUMER_DATASET_TITLE } from '../../fixtures/dataset-title';

/**
 * Searches for the consumer test dataset by title and navigates to it.
 * Uses the search page at /en-GB/search to find the dataset published
 * by the consumer-setup project.
 */
export async function goToDataset(page: Page) {
  await page.goto(`/en-GB/search?keywords=${encodeURIComponent(CONSUMER_DATASET_TITLE)}`);
  const datasetLink = page.locator('.index-list__item a').first();
  await expect(datasetLink).toBeVisible();
  await datasetLink.click();
  // Verify we landed on a dataset page with the expected title
  await expect(page.locator('h1.govuk-heading-xl')).toContainText(CONSUMER_DATASET_TITLE);
  return page.url();
}

/**
 * Resolves the consumer test dataset URL using a temporary browser page.
 * Intended for use in beforeAll hooks where a per-test page is not available.
 */
export async function resolveDatasetUrl(browser: Browser): Promise<string> {
  const page = await browser.newPage();
  const url = await goToDataset(page);
  await page.close();
  return url;
}
