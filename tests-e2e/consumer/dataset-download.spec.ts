import { test, expect, Page } from '@playwright/test';

// Helper to navigate to the download tab for the first dataset
async function goToDownloadTab(page: Page) {
  await page.goto('/en-GB/all');
  const firstDataset = page.locator('.index-list__item a').first();
  await firstDataset.click();
  await page.getByRole('tab', { name: 'Download data' }).click();
}

// Helper to fill the download form and submit, returning the download response
async function submitDownload(
  page: Page,
  opts: {
    viewType: 'filtered' | 'unfiltered';
    format: 'csv' | 'xlsx' | 'json';
    viewChoice: 'formatted' | 'raw';
    extended: 'yes' | 'no';
    language: 'en-GB' | 'cy-GB';
  }
) {
  await page.locator(`input[name="view_type"][value="${opts.viewType}"]`).check({ force: true });
  await page.locator(`input[name="format"][value="${opts.format}"]`).check({ force: true });
  await page.locator(`input[name="view_choice"][value="${opts.viewChoice}"]`).check({ force: true });
  await page.locator(`input[name="extended"][value="${opts.extended}"]`).check({ force: true });
  await page.locator(`input[name="download_language"][value="${opts.language}"]`).check({ force: true });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download data' }).click();
  return downloadPromise;
}

test.describe('Download Panel', () => {
  test('Shows download format options', async ({ page }) => {
    await goToDownloadTab(page);
    await expect(page.getByLabel('CSV')).toBeVisible();
    await expect(page.getByLabel('Excel')).toBeVisible();
    await expect(page.getByLabel('JSON')).toBeVisible();
  });

  test('Shows download button', async ({ page }) => {
    await goToDownloadTab(page);
    await expect(page.getByRole('button', { name: 'Download data' })).toBeVisible();
  });

  test('Shows metadata download option', async ({ page }) => {
    await goToDownloadTab(page);
    await expect(page.getByRole('heading', { name: 'Metadata' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download metadata' })).toBeVisible();
  });

  test('Shows language selection for download', async ({ page }) => {
    await goToDownloadTab(page);
    await expect(page.getByLabel('English')).toBeVisible();
    await expect(page.getByLabel('Welsh')).toBeVisible();
  });

  test('Shows view type options', async ({ page }) => {
    await goToDownloadTab(page);
    const viewTypeOptions = page.locator('input[name="view_type"]');
    await expect(viewTypeOptions.first()).toBeVisible();
  });

  test('Shows number formatting options', async ({ page }) => {
    await goToDownloadTab(page);
    await expect(page.getByLabel('Formatted numbers', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Unformatted numbers', { exact: true })).toBeVisible();
  });

  test('Shows extended data options', async ({ page }) => {
    await goToDownloadTab(page);
    const extendedOptions = page.locator('input[name="extended"]');
    await expect(extendedOptions).toHaveCount(2);
    await expect(page.getByLabel('Yes', { exact: true })).toBeVisible();
    await expect(page.getByLabel('No', { exact: true })).toBeVisible();
  });
});

test.describe('Download preserves filter state', () => {
  test('Hidden field contains filter options after applying filters', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();

    const filterCheckbox = page
      .locator('.checkboxes__input__filter:not([id$="-all"]):not(details .checkboxes__input__filter)')
      .first();

    await filterCheckbox.check({ force: true, timeout: 5000 });
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await page.getByRole('tab', { name: 'Download data' }).click();

    const filterOptionsField = page.locator('#selected_filter_options');
    await expect(filterOptionsField).toBeAttached();
  });
});

// CSV download - all 16 variations (view_type × view_choice × extended × language)
test.describe('CSV Download Variations', () => {
  const viewTypes = ['filtered', 'unfiltered'] as const;
  const viewChoices = ['formatted', 'raw'] as const;
  const extendedOpts = ['yes', 'no'] as const;
  const languages = ['en-GB', 'cy-GB'] as const;

  for (const viewType of viewTypes) {
    for (const viewChoice of viewChoices) {
      for (const extended of extendedOpts) {
        for (const language of languages) {
          const label = `CSV: ${viewType}, ${viewChoice}, extended=${extended}, lang=${language}`;

          test(label, async ({ page }) => {
            await goToDownloadTab(page);

            const download = await submitDownload(page, {
              viewType,
              format: 'csv',
              viewChoice,
              extended,
              language
            });

            const suggestedFilename = download.suggestedFilename();
            expect(suggestedFilename).toMatch(/\.csv$/);
          });
        }
      }
    }
  }
});

// Excel and JSON - single test each to confirm the format works
test.describe('Non-CSV Format Downloads', () => {
  test('Excel download returns an xlsx file', async ({ page }) => {
    await goToDownloadTab(page);

    const download = await submitDownload(page, {
      viewType: 'unfiltered',
      format: 'xlsx',
      viewChoice: 'formatted',
      extended: 'no',
      language: 'en-GB'
    });

    const suggestedFilename = download.suggestedFilename();
    expect(suggestedFilename).toMatch(/\.xlsx$/);
  });

  test('JSON download returns a json file', async ({ page }) => {
    await goToDownloadTab(page);

    const download = await submitDownload(page, {
      viewType: 'unfiltered',
      format: 'json',
      viewChoice: 'formatted',
      extended: 'no',
      language: 'en-GB'
    });

    const suggestedFilename = download.suggestedFilename();
    expect(suggestedFilename).toMatch(/\.json$/);
  });
});
