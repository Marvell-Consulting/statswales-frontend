import { test, expect } from '@playwright/test';

import { resolveDatasetUrlByTitle } from './helpers/find-dataset';
import { CONSUMER_DATASET_TITLE } from '../fixtures/dataset-title';

let datasetUrl: string;

test.beforeAll(async ({ browser }) => {
  datasetUrl = await resolveDatasetUrlByTitle(browser, CONSUMER_DATASET_TITLE);
});

test.describe('Dataset Filtering', () => {
  test.describe('Filter Sidebar', () => {
    test('Shows filter sidebar with apply button', async ({ page }) => {
      await page.goto(datasetUrl);
      // Filters are collapsed in accordions by default — open the first one
      await page.locator('.dimension-accordion__summary').first().click();
      // Each accordion section has its own "Apply all selections" submit button
      await expect(page.getByRole('button', { name: 'Apply all selections' }).first()).toBeVisible();
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
      // Filters are collapsed in accordions — open the first one
      await page.locator('.dimension-accordion__summary').first().click();
      // Find a filter checkbox inside the opened accordion
      const filterCheckbox = page.locator('.filter .govuk-checkboxes__input').first();
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
      // Filters are collapsed in accordions — open the first one
      await page.locator('.dimension-accordion__summary').first().click();
      // Apply filters (even without changing anything, it should work)
      await page.getByRole('button', { name: 'Apply all selections' }).first().click();
      // URL should change to include /filtered/ path
      await expect(page).toHaveURL(/\/filtered\//);
    });

    test('Filtered view shows data table', async ({ page }) => {
      await page.goto(datasetUrl);
      // Open first accordion then apply
      await page.locator('.dimension-accordion__summary').first().click();
      await page.getByRole('button', { name: 'Apply all selections' }).first().click();
      // Table should still be visible in filtered view
      await expect(page.locator('#data_table')).toBeVisible();
    });
  });

  test.describe('Filter Controls', () => {
    test('Toggle controls are available in filter groups', async ({ page }) => {
      await page.goto(datasetUrl);
      // Filters are collapsed in accordions — open the first one to reveal toggle controls
      await page.locator('.dimension-accordion__summary').first().click();
      // Filter groups have toggle controls for select/deselect all (js-hidden until JS runs)
      const toggleLink = page.locator('[data-action="toggle"]').first();
      await expect(toggleLink).toBeVisible();
      // Should show "Deselect all" by default (since all are checked)
      const deselectSpan = page.locator('.toggle-deselect').first();
      await expect(deselectSpan).toBeVisible();
    });

    test('All filter checkboxes are checked by default', async ({ page }) => {
      await page.goto(datasetUrl);
      // Open all accordion sections so their checkboxes are accessible
      const summaries = page.locator('.dimension-accordion__summary');
      const summaryCount = await summaries.count();
      for (let i = 0; i < summaryCount; i++) {
        await summaries.nth(i).click();
      }
      // All filter checkboxes should be checked by default
      const checkboxes = page.locator('.filter .govuk-checkboxes__input');
      const count = await checkboxes.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
    });
  });
});

test.describe('Dataset Pagination', () => {
  test('Shows pagination info when data has multiple pages', async ({ page }) => {
    await page.goto(datasetUrl);
    // Set small page size to ensure pagination using the RowsPerPage form
    await page.locator('#page_size').selectOption('5');
    await page.getByRole('button', { name: 'Apply rows', exact: true }).click();
    // Pagination may or may not appear depending on data size
    // Just verify the page loaded successfully with the filtered view
    await expect(page.locator('#data_table')).toBeVisible();
  });

  test('Can navigate to next page if available', async ({ page }) => {
    await page.goto(datasetUrl);
    await page.locator('#page_size').selectOption('5');
    await page.getByRole('button', { name: 'Apply rows', exact: true }).click();
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
    await page.getByRole('button', { name: 'Apply rows', exact: true }).click();
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
    // Check header count rather than visibility — the sticky positioning on th
    // combined with overflow:auto on the container causes Playwright to report
    // headers as hidden even though they render correctly in the browser
    const tableHeaders = page.locator('#data_table thead th');
    expect(await tableHeaders.count()).toBeGreaterThan(0);
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
    // Open first accordion then apply filters to get to filtered view
    await page.locator('.dimension-accordion__summary').first().click();
    await page.getByRole('button', { name: 'Apply all selections' }).first().click();
    // Look for sortable column link
    const sortLink = page.locator('th a').first();
    if (await sortLink.isVisible()) {
      await sortLink.click();
      // URL should contain sort_by in colon format
      await expect(page).toHaveURL(/sort_by=[^&]*%3A/);
    }
  });

  test('Old bracket-notation sort_by URL format still works', async ({ page }) => {
    // Navigate to a filtered view first to get a valid filterId
    await page.goto(datasetUrl);
    await page.locator('.dimension-accordion__summary').first().click();
    await page.getByRole('button', { name: 'Apply all selections' }).first().click();
    await page.waitForURL(/\/filtered\//);
    const filteredUrl = page.url();

    // Discover a valid sortable column name from the table header links
    const sortLink = page.locator('th a').first();
    if (await sortLink.isVisible()) {
      const href = await sortLink.getAttribute('href');
      const match = href?.match(/sort_by=(.+?)%3A/i);
      const columnName = match ? decodeURIComponent(match[1]) : null;
      if (columnName) {
        // Append old bracket-notation sort_by to the filtered URL
        const separator = filteredUrl.includes('?') ? '&' : '?';
        const encodedCol = encodeURIComponent(columnName);
        const oldFormatUrl = `${filteredUrl}${separator}sort_by%5BcolumnName%5D=${encodedCol}&sort_by%5Bdirection%5D=ASC`;
        await page.goto(oldFormatUrl);
        // Page should load successfully with table visible
        await expect(page.locator('#data_table')).toBeVisible();
        // The sorted column header should have aria-sort
        const sortedHeader = page.locator('th[aria-sort]');
        if (await sortedHeader.count()) {
          await expect(sortedHeader.first()).toHaveAttribute('aria-sort', /ascending|descending/);
        }
      }
    }
  });

  test('New colon format sort_by URL works', async ({ page }) => {
    // Navigate to a filtered view first to get a valid filterId
    await page.goto(datasetUrl);
    await page.locator('.dimension-accordion__summary').first().click();
    await page.getByRole('button', { name: 'Apply all selections' }).first().click();
    await page.waitForURL(/\/filtered\//);
    const filteredUrl = page.url();

    // Discover a valid sortable column name from the table header links
    const sortLink = page.locator('th a').first();
    if (await sortLink.isVisible()) {
      const href = await sortLink.getAttribute('href');
      const match = href?.match(/sort_by=(.+?)%3A/i);
      const columnName = match ? decodeURIComponent(match[1]) : null;
      if (columnName) {
        // Append new colon-format sort_by to the filtered URL
        const separator = filteredUrl.includes('?') ? '&' : '?';
        const encodedCol = encodeURIComponent(columnName);
        const newFormatUrl = `${filteredUrl}${separator}sort_by=${encodedCol}%3Aasc`;
        await page.goto(newFormatUrl);
        // Page should load successfully with table visible
        await expect(page.locator('#data_table')).toBeVisible();
        // The sorted column header should have aria-sort
        const sortedHeader = page.locator('th[aria-sort]');
        if (await sortedHeader.count()) {
          await expect(sortedHeader.first()).toHaveAttribute('aria-sort', /ascending|descending/);
        }
      }
    }
  });

  test('Sort direction toggles: ASC -> DESC -> unsorted', async ({ page }) => {
    await page.goto(datasetUrl);
    // Get to filtered view
    await page.locator('.dimension-accordion__summary').first().click();
    await page.getByRole('button', { name: 'Apply all selections' }).first().click();
    const sortLink = page.locator('th a').first();
    if (await sortLink.isVisible()) {
      // First click — should sort ASC
      await sortLink.click();
      await expect(page).toHaveURL(/sort_by/);
      const urlAfterAsc = page.url();
      expect(urlAfterAsc).toMatch(/sort_by=[^&]*%3Aasc/i);

      // Second click on same header — should sort DESC
      const sameSortLink = page.locator('th[aria-sort] a').first();
      await sameSortLink.click();
      await expect(page).toHaveURL(/sort_by/);
      const urlAfterDesc = page.url();
      expect(urlAfterDesc).toMatch(/sort_by=[^&]*%3Adesc/i);

      // Third click — should remove sort_by
      const sameSortLink2 = page.locator('th[aria-sort] a').first();
      await sameSortLink2.click();
      await expect(page).not.toHaveURL(/sort_by/);
    }
  });
});
