import { test, expect } from '@playwright/test';

test.describe('Download Panel', () => {
  test('Shows download format options', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Click Download tab
    await page.getByRole('tab', { name: 'Download' }).click();
    // Should show format options
    await expect(page.getByLabel('CSV')).toBeVisible();
    await expect(page.getByLabel('Excel')).toBeVisible();
    await expect(page.getByLabel('JSON')).toBeVisible();
  });

  test('Shows download button', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    await expect(page.getByRole('button', { name: 'Download data' })).toBeVisible();
  });

  test('Shows metadata download option', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    // Should show metadata download section
    await expect(page.getByRole('heading', { name: 'Metadata' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download metadata' })).toBeVisible();
  });

  test('Shows language selection for download', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    // Should show language options
    await expect(page.getByLabel('English')).toBeVisible();
    await expect(page.getByLabel('Welsh')).toBeVisible();
  });
});

test.describe('Download with Filters', () => {
  test('Download tab shows view type options', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    // Should show download view options (filtered vs all data)
    const viewTypeOptions = page.locator('input[name="view_type"]');
    await expect(viewTypeOptions.first()).toBeVisible();
  });

  test('Download tab shows format options', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    // CSV, Excel, JSON options
    await expect(page.getByLabel('CSV')).toBeVisible();
    await expect(page.getByLabel('Excel')).toBeVisible();
    await expect(page.getByLabel('JSON')).toBeVisible();
  });

  test('Download tab shows data choice options', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    // View choice options (raw, formatted, etc.)
    const viewChoiceOptions = page.locator('input[name="view_choice"]');
    await expect(viewChoiceOptions.first()).toBeVisible();
  });

  test('Download button is present', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    await expect(page.getByRole('button', { name: 'Download data' })).toBeVisible();
  });

  test('Download preserves filter state', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Apply filters first
    await page.locator('#page_size').selectOption('25');
    await page.getByRole('button', { name: 'Apply' }).click();
    // Go to download tab
    await page.getByRole('tab', { name: 'Download' }).click();
    // Hidden field should contain filter options
    const filterOptionsField = page.locator('#selected_filter_options');
    await expect(filterOptionsField).toBeAttached();
  });
});
