import { expect, Browser, Page } from '@playwright/test';

/**
 * Searches for a dataset by title and navigates to it.
 * Uses the search page at /en-GB/search to find the dataset.
 */
export async function findDataset(page: Page, title: string) {
  await page.goto(`/en-GB/search?keywords=${encodeURIComponent(title)}`);
  const datasetLink = page.locator('.index-list__item a').first();
  await expect(datasetLink).toBeVisible();
  await datasetLink.click();
  // Verify we landed on a dataset page with the expected title
  await expect(page.locator('h1.govuk-heading-xl')).toContainText(title);
  return page.url();
}

/**
 * Searches for a dataset by title and returns its URL.
 * Intended for use in beforeAll hooks where a per-test page is not available.
 */
export async function resolveDatasetUrlByTitle(browser: Browser, title: string): Promise<string> {
  const page = await browser.newPage();
  const url = await findDataset(page, title);
  await page.close();
  return url;
}
