import { expect, Browser, Page } from '@playwright/test';

/**
 * Searches for a dataset by title and navigates to it.
 * Uses the search page at /en-GB/search to find the dataset.
 * Retries a few times to handle search index lag after publishing.
 */
export async function findDataset(page: Page, title: string, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    await page.goto(`/en-GB/search?keywords=${encodeURIComponent(title)}`);
    const datasetLink = page.locator('.index-list__item a').first();
    if (await datasetLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await datasetLink.click();
      await expect(page.locator('h1.govuk-heading-xl')).toContainText(title);
      await page.click('label[for="tableChoiceData"]');
      await page.click('#tableChooserBtn');
      await expect(page.locator('h1.govuk-heading-xl')).toContainText(title);
      return page.url();
    }
    // Search index may not have caught up yet — wait before retrying
    await page.waitForTimeout(3_000);
  }

  throw new Error(`Dataset "${title}" not found in search after ${maxRetries} attempts`);
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

/**
 * Searches for a dataset by title and navigates to it.
 * Uses the search page at /en-GB/search to find the dataset.
 * Retries a few times to handle search index lag after publishing.
 */
export async function findPivotDataset(page: Page, title: string, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    await page.goto(`/en-GB/search?keywords=${encodeURIComponent(title)}`);
    const datasetLink = page.locator('.index-list__item a').first();
    if (await datasetLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await datasetLink.click();
      await expect(page.locator('h1.govuk-heading-xl')).toContainText(title);
      return page.url();
    }
    await page.waitForTimeout(3_000);
  }

  throw new Error(`Dataset "${title}" not found in search after ${maxRetries} attempts`);
}

/**
 * Searches for a dataset by title and returns its URL.
 * Intended for use in beforeAll hooks where a per-test page is not available.
 */
export async function resolvePivotDatasetUrlByTitle(browser: Browser, title: string): Promise<string> {
  const page = await browser.newPage();
  const url = await findPivotDataset(page, title);
  await page.close();
  return url;
}
