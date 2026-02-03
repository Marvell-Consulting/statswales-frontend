import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test('Displays search page heading', async ({ page }) => {
    await page.goto('/en-GB/search');
    await expect(page.getByRole('heading', { name: 'Search StatsWales' })).toBeVisible();
  });

  test('Shows search input and button', async ({ page }) => {
    await page.goto('/en-GB/search');
    await expect(page.locator('#search-input')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeVisible();
  });

  test('Can perform a search', async ({ page }) => {
    await page.goto('/en-GB/search');
    await page.locator('#search-input').fill('test');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    // URL should contain search query
    await expect(page).toHaveURL(/keywords=test/);
  });

  test('Can switch to Welsh', async ({ page }) => {
    await page.goto('/en-GB/search');
    await page.getByText('Cymraeg').click();
    await expect(page).toHaveURL(/\/cy/);
  });
});
