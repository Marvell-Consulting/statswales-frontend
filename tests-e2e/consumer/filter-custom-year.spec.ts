import { test, expect } from '../fixtures/test';
import { resolveDatasetUrlByTitle } from './helpers/find-dataset';
import { CUSTOM_YEAR_DATASET_TITLE } from '../fixtures/dataset-title';

// Regression test for: filter values containing slashes (e.g. "2016/17") were encoded as
// "2016%2F17" in checkbox value attributes but the API returned them decoded, causing the
// checked state to be lost on the filtered page reload.
test.describe('Filter checkbox state for custom-year dimensions', () => {
  let datasetUrl: string;

  test.beforeAll(async ({ browser }) => {
    datasetUrl = await resolveDatasetUrlByTitle(browser, CUSTOM_YEAR_DATASET_TITLE);
  });

  test('Checkboxes with slash-containing values remain checked after applying filter', async ({ page }) => {
    await page.goto(datasetUrl);

    // Open the Period dimension accordion
    const periodAccordion = page.locator('.dimension-accordion').filter({ hasText: 'Period' });
    await periodAccordion.locator('.dimension-accordion__summary').click();

    // Year values like "2016/17" are encoded as "2016%2F17" in the checkbox value attributes
    const slashCheckboxes = periodAccordion.locator('.govuk-checkboxes__input[value*="%2F"]');
    await expect(slashCheckboxes.first()).toBeVisible();
    expect(await slashCheckboxes.count()).toBeGreaterThan(0);

    // Uncheck the first slash-value year to create a specific deselected value to verify
    const firstSlashCheckbox = slashCheckboxes.first();
    await firstSlashCheckbox.uncheck({ force: true });
    const deselectedValue = await firstSlashCheckbox.getAttribute('value');
    await expect(firstSlashCheckbox).not.toBeChecked();

    // Apply the filter — redirects to the filtered view
    await periodAccordion.getByRole('button', { name: 'Apply all selections' }).click();
    await expect(page).toHaveURL(/\/filtered\//);

    // Re-open the Period accordion in the filtered view
    const periodAccordionFiltered = page.locator('.dimension-accordion').filter({ hasText: 'Period' });
    await periodAccordionFiltered.locator('.dimension-accordion__summary').click();

    // The deselected slash-value checkbox must still be unchecked (this was the bug)
    await expect(
      periodAccordionFiltered.locator(`.govuk-checkboxes__input[value="${deselectedValue}"]`)
    ).not.toBeChecked();

    // All other slash-value checkboxes must still be checked
    const remainingSlashCheckboxes = periodAccordionFiltered.locator(
      `.govuk-checkboxes__input[value*="%2F"]:not([value="${deselectedValue}"])`
    );
    const count = await remainingSlashCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(remainingSlashCheckboxes.nth(i)).toBeChecked();
    }
  });
});
