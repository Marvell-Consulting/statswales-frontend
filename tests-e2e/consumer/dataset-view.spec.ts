import { test, expect } from '@playwright/test';

test.describe('Dataset View', () => {
  test('Can view a published dataset from all datasets page', async ({ page }) => {
    await page.goto('/en-GB/all');
    // Click the first dataset link
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Should show dataset title as h1
    await expect(page.locator('h1.govuk-heading-xl')).toBeVisible();
  });

  test('Shows tab navigation', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await expect(page.getByRole('tab', { name: 'View data', exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Download data' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Dataset history' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'About this dataset' })).toBeVisible();
  });

  test('Data tab shows table with filters', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Data tab should be active by default and show table
    await expect(page.locator('#data_table')).toBeVisible();
    // Should show page size selector
    await expect(page.locator('#page_size')).toBeVisible();
  });

  test('About tab shows dataset information', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Click About tab
    await page.getByRole('tab', { name: 'About this dataset' }).click();
    // Should show main information section
    await expect(page.getByRole('heading', { name: 'Main information' })).toBeVisible();
  });

  test('Can switch to Welsh on dataset view', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByText('Cymraeg').click();
    // URL should change to Welsh
    await expect(page).toHaveURL(/\/cy/);
  });
});
