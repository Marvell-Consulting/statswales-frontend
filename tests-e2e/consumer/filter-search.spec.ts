import { test, expect } from '@playwright/test';

import { resolveDatasetUrl } from './helpers/find-dataset';

let datasetUrl: string;

test.beforeAll(async ({ browser }) => {
  datasetUrl = await resolveDatasetUrl(browser);
});

test.describe('Filter Search', () => {
  test.describe('Search input visibility', () => {
    test('Shows search input for filters with more than 8 options', async ({ page }) => {
      await page.goto(datasetUrl);
      // The Area filter has 24 options (23 LAs + Wales) — search should be visible
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');
      await expect(searchInput).toBeVisible();
    });

    test('Hides search input for filters with 8 or fewer options', async ({ page }) => {
      await page.goto(datasetUrl);
      // The Staff type filter has only 3 options — search should be hidden
      const staffFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Staff type' });
      const searchContainer = staffFilter.locator('.filter-search');
      await expect(searchContainer).toHaveClass(/js-hidden/);
    });
  });

  test.describe('Search filtering', () => {
    test('Typing filters checkboxes by label match', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');
      const filterBody = areaFilter.locator('.filter-body');

      await searchInput.fill('Cardiff');
      // Wait for debounce
      await page.waitForTimeout(350);

      // Cardiff checkbox should be visible
      const cardiffCheckbox = filterBody.locator('.govuk-checkboxes__item', { hasText: 'Cardiff' });
      await expect(cardiffCheckbox).toBeVisible();

      // A non-matching area like Gwynedd should be hidden
      const gwyneddCheckbox = filterBody.locator('.govuk-checkboxes__item', { hasText: 'Gwynedd' });
      await expect(gwyneddCheckbox).toBeHidden();
    });

    test('Search is case-insensitive', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');
      const filterBody = areaFilter.locator('.filter-body');

      await searchInput.fill('cardiff');
      await page.waitForTimeout(350);

      const cardiffCheckbox = filterBody.locator('.govuk-checkboxes__item', { hasText: 'Cardiff' });
      await expect(cardiffCheckbox).toBeVisible();
    });

    test('Clearing search restores all checkboxes', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');
      const filterBody = areaFilter.locator('.filter-body');

      // Use the top-level "Wales" checkbox (not nested inside a <details>)
      const walesCheckbox = filterBody.locator(':scope > .govuk-checkboxes > .govuk-checkboxes__item', {
        hasText: 'Wales'
      });

      // Type to filter for something that doesn't match Wales
      await searchInput.fill('Cardiff');
      await page.waitForTimeout(350);

      // Wales stays visible (as a parent of matching Cardiff), but confirm filtering is active
      const gwyneddCheckbox = filterBody.locator('.govuk-checkboxes__item', { hasText: 'Gwynedd' });
      await expect(gwyneddCheckbox).toBeHidden();

      // Clear the search
      await searchInput.fill('');
      await page.waitForTimeout(350);

      // Top-level checkbox should be visible again
      await expect(walesCheckbox).toBeVisible();
      // Nested items are restored (inline display style cleared) but inside collapsed
      // <details>, so they aren't "visible" in the Playwright sense. Verify the inline
      // display:none has been removed.
      const hiddenByStyle = await gwyneddCheckbox.evaluate((el) => el.style.display === 'none');
      expect(hiddenByStyle).toBe(false);
    });

    test('No matches hides all checkboxes and details', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');
      const filterBody = areaFilter.locator('.filter-body');

      await searchInput.fill('xyznonexistent');
      await page.waitForTimeout(350);

      // All checkboxes should be hidden
      const visibleCheckboxes = filterBody.locator('.govuk-checkboxes__item:visible');
      await expect(visibleCheckboxes).toHaveCount(0);
    });
  });

  test.describe('Nested filter handling', () => {
    test('Parent stays visible when nested child matches', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');
      const filterBody = areaFilter.locator('.filter-body');

      // Search for a local authority that is nested under Wales
      await searchInput.fill('Cardiff');
      await page.waitForTimeout(350);

      // The parent "Wales" checkbox should still be visible as it contains matching children
      const walesCheckbox = filterBody.locator('.govuk-checkboxes__item', { hasText: 'Wales' });
      await expect(walesCheckbox).toBeVisible();

      // The matching child should be visible
      const cardiffCheckbox = filterBody.locator('.govuk-checkboxes__item', { hasText: 'Cardiff' });
      await expect(cardiffCheckbox).toBeVisible();
    });

    test('Parent details element is expanded when child matches', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');
      const filterBody = areaFilter.locator('.filter-body');

      await searchInput.fill('Cardiff');
      await page.waitForTimeout(350);

      // The details element containing Cardiff should be open
      const openDetails = filterBody.locator('details[open]');
      await expect(openDetails.first()).toBeVisible();
    });

    test('Details elements are hidden when no descendants match', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');
      const filterBody = areaFilter.locator('.filter-body');

      await searchInput.fill('xyznonexistent');
      await page.waitForTimeout(350);

      // All details elements should be hidden
      const visibleDetails = filterBody.locator('details:visible');
      await expect(visibleDetails).toHaveCount(0);
    });

    test('Clearing search collapses expanded details', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');
      const filterBody = areaFilter.locator('.filter-body');

      // Search to expand details
      await searchInput.fill('Cardiff');
      await page.waitForTimeout(350);
      await expect(filterBody.locator('details[open]').first()).toBeVisible();

      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(350);

      // Details should be collapsed
      const openDetails = filterBody.locator('details[open]');
      await expect(openDetails).toHaveCount(0);
    });
  });

  test.describe('Interaction with filter controls', () => {
    test('Select all works while search is active', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');

      // Search first to narrow visible items
      await searchInput.fill('Cardiff');
      await page.waitForTimeout(350);

      // Click "Select all" in the filter body controls
      const selectAll = areaFilter.locator('.filter-body [data-action="select-all"]').first();
      await selectAll.click();

      // The visible Cardiff checkbox should be checked
      const cardiffInput = areaFilter.locator('.filter-body input[type="checkbox"]:visible').first();
      await expect(cardiffInput).toBeChecked();
    });

    test('None/clear works while search is active', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');

      // Search and select all first
      await searchInput.fill('Cardiff');
      await page.waitForTimeout(350);

      const selectAll = areaFilter.locator('.filter-body [data-action="select-all"]').first();
      await selectAll.click();

      // Click "None" to clear
      const clearLink = areaFilter.locator('.filter-body [data-action="clear"]').first();
      await clearLink.click();

      // Visible checkboxes should be unchecked
      const cardiffInput = areaFilter.locator('.filter-body input[type="checkbox"]:visible').first();
      await expect(cardiffInput).not.toBeChecked();
    });
  });

  test.describe('Debounce behaviour', () => {
    test('Search does not filter immediately on keypress', async ({ page }) => {
      await page.goto(datasetUrl);
      const areaFilter = page.locator('[id^="filter-"]').filter({ hasText: 'Area' });
      const searchInput = areaFilter.locator('.filter-search-input');
      const filterBody = areaFilter.locator('.filter-body');

      // Count visible checkboxes before typing
      const initialCount = await filterBody.locator('.govuk-checkboxes__item:visible').count();

      // Type rapidly without waiting for debounce
      await searchInput.pressSequentially('xyznonexistent', { delay: 20 });

      // Immediately after typing, items should not yet be hidden (debounce hasn't fired)
      const immediateCount = await filterBody.locator('.govuk-checkboxes__item:visible').count();
      expect(immediateCount).toBe(initialCount);

      // After debounce fires, items should be hidden
      await page.waitForTimeout(400);
      const debouncedCount = await filterBody.locator('.govuk-checkboxes__item:visible').count();
      expect(debouncedCount).toBe(0);
    });
  });
});
