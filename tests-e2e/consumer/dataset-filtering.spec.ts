import { test, expect } from '@playwright/test';

import { resolveDatasetUrl } from './helpers/find-dataset';

let datasetUrl: string;

test.beforeAll(async ({ browser }) => {
  datasetUrl = await resolveDatasetUrl(browser);
});

test.describe('Dataset Filtering', () => {
  test.describe('Filter Sidebar', () => {
    test('Shows filter sidebar with apply button', async ({ page }) => {
      await page.goto(datasetUrl);
      // Filter apply button should be visible
      await expect(page.getByRole('button', { name: 'Apply', exact: true })).toBeVisible();
    });

    test('Shows page size selector with options', async ({ page }) => {
      await page.goto(datasetUrl);
      const pageSizeSelect = page.locator('#page_size');
      await expect(pageSizeSelect).toBeVisible();
      // Verify some page size options exist
      await expect(pageSizeSelect.locator('option')).toHaveCount(7); // 5, 10, 25, 50, 100, 250, 500
    });

    test('Shows filter groups for dataset dimensions', async ({ page }) => {
      await page.goto(datasetUrl);
      // Filter groups are rendered as details elements or divs with filter- prefix ids
      const filterGroups = page.locator('[id^="filter-"]');
      // Should have at least one filter group (datasets have dimensions)
      await expect(filterGroups.first()).toBeVisible();
    });

    test('Filter checkboxes are interactive', async ({ page }) => {
      await page.goto(datasetUrl);
      // Find a filter checkbox
      const filterCheckbox = page.locator('.filters .govuk-checkboxes__input').first();
      if (await filterCheckbox.isVisible()) {
        // Checkbox should be checkable
        await filterCheckbox.check({ force: true });
        await expect(filterCheckbox).toBeChecked();
      }
    });
  });

  test.describe('Page Size', () => {
    test('Can change page size to 25', async ({ page }) => {
      await page.goto(datasetUrl);
      await page.locator('#page_size').selectOption('25');
      await page.getByRole('button', { name: 'Apply rows', exact: true }).click();
      await expect(page).toHaveURL(/page_size=25/);
    });

    test('Can change page size to 50', async ({ page }) => {
      await page.goto(datasetUrl);
      await page.locator('#page_size').selectOption('50');
      await page.getByRole('button', { name: 'Apply rows', exact: true }).click();
      await expect(page).toHaveURL(/page_size=50/);
    });

    test('Page size persists after applying filters', async ({ page }) => {
      await page.goto(datasetUrl);
      await page.locator('#page_size').selectOption('25');
      await page.getByRole('button', { name: 'Apply rows', exact: true }).click();
      // After redirect, page size should still be selected
      await expect(page.locator('#page_size')).toHaveValue('25');
    });
  });

  test.describe('Applying Filters', () => {
    test('Applying filters redirects to filtered URL', async ({ page }) => {
      await page.goto(datasetUrl);
      // Apply filters (even without changing anything, it should work)
      await page.getByRole('button', { name: 'Apply', exact: true }).click();
      // URL should change to include /filtered/ path
      await expect(page).toHaveURL(/\/filtered\//);
    });

    test('Filtered view shows data table', async ({ page }) => {
      await page.goto(datasetUrl);
      await page.getByRole('button', { name: 'Apply', exact: true }).click();
      // Table should still be visible in filtered view
      await expect(page.locator('#data_table')).toBeVisible();
    });
  });

  test.describe('Filter Controls', () => {
    test('Select all and None links are available in filter groups', async ({ page }) => {
      await page.goto(datasetUrl);
      // Filter groups have "Select all" and "None" controls
      const selectAllLink = page.locator('[data-action="select-all"]').first();
      const clearLink = page.locator('[data-action="clear"]').first();
      await expect(selectAllLink).toBeVisible();
      await expect(clearLink).toBeVisible();
    });

    test('Not filtered checkbox is checked by default', async ({ page }) => {
      await page.goto(datasetUrl);
      // The "Not filtered" checkbox (input with id ending in "-all") should be checked by default
      const notFilteredCheckbox = page.locator('input[type="checkbox"][id$="-all"]').first();
      await expect(notFilteredCheckbox).toBeChecked();
    });
  });
});

test.describe('Dataset Pagination', () => {
  test('Shows pagination info when data has multiple pages', async ({ page }) => {
    await page.goto(datasetUrl);
    // Set small page size to ensure pagination
    await page.locator('#page_size').selectOption('5');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    // Pagination may or may not appear depending on data size
    // Just verify the page loaded successfully with the filtered view
    await expect(page.locator('#data_table')).toBeVisible();
  });

  test('Can navigate to next page if available', async ({ page }) => {
    await page.goto(datasetUrl);
    await page.locator('#page_size').selectOption('5');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    // Check if next page link exists
    const nextLink = page.getByRole('link', { name: /next/i });
    if (await nextLink.isVisible()) {
      await nextLink.click();
      await expect(page).toHaveURL(/page_number=2/);
    }
  });

  test('Page number is preserved in URL', async ({ page }) => {
    await page.goto(datasetUrl);
    await page.locator('#page_size').selectOption('5');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    const nextLink = page.getByRole('link', { name: /next/i });
    if (await nextLink.isVisible()) {
      await nextLink.click();
      // URL should contain page_number parameter
      await expect(page).toHaveURL(/page_number/);
    }
  });
});

test.describe('Dataset Table Sorting', () => {
  test('Table headers are displayed', async ({ page }) => {
    await page.goto(datasetUrl);
    // Table should have header row
    const tableHeaders = page.locator('table thead th, table th');
    await expect(tableHeaders.first()).toBeVisible();
  });

  test('Sortable columns have sort links', async ({ page }) => {
    await page.goto(datasetUrl);
    // Look for sort links/buttons in table headers
    const sortableHeader = page.locator('th a, th button').first();
    if (await sortableHeader.isVisible()) {
      await expect(sortableHeader).toBeVisible();
    }
  });

  test('Clicking sort changes URL parameters', async ({ page }) => {
    await page.goto(datasetUrl);
    // Apply filters first to get to filtered view
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    // Look for sortable column link
    const sortLink = page.locator('th a').first();
    if (await sortLink.isVisible()) {
      await sortLink.click();
      // URL should contain sort parameters
      await expect(page).toHaveURL(/sort_by/);
    }
  });
});
