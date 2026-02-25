/* eslint-disable no-console */
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PRODUCTION_SITE_URL = process.env.CHECK_PROD_URL;
const PUBLISHED_DATASET_LIST_URL = `${process.env.CHECK_PROD_API}/v1/?lang=en-gb&page_size=10000`;
const PROGRESS_FILE = path.join(__dirname, '../../datasets-progress.json');
const FAILING_DATASETS_FILE = path.join(__dirname, '../../failing-datasets.txt');

const FULL_RUN_TIMEOUT_MS = 1 * 60 * 60 * 1000; // 1 hour
const INITIAL_PAGE_LOAD_TIMEOUT_MS = 10 * 1000; // 10 seconds
const PAGE_RENDER_TIMEOUT_MS = 2 * 1000; // 2 seconds
const FILTER_APPLY_TIMEOUT_MS = 10 * 1000; // 10 seconds
const TABLE_RENDER_TIMEOUT_MS = 2 * 1000; // 2 seconds
const AVOID_RATE_LIMIT_MS = 500; // 0.5 second

// Determine run mode from TEST_MODE env var: 'recheck', 'reset', or default 'check'
const MODE = process.env.TEST_MODE || 'check';

interface Dataset {
  id: string;
  title: string;
  url: string;
  checked: boolean;
  passed: boolean | null;
  checkedAt?: string;
  error?: string;
}

interface ProgressData {
  lastUpdated: string;
  totalDatasets: number;
  checkedCount: number;
  passedCount: number;
  failedCount: number;
  datasets: Dataset[];
}

async function fetchDatasetList(): Promise<Dataset[]> {
  const response = await fetch(PUBLISHED_DATASET_LIST_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch datasets: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.data.map((dataset: { id: string; title: string }) => ({
    id: dataset.id,
    title: dataset.title,
    url: `${PRODUCTION_SITE_URL}/en-GB/${dataset.id}`,
    checked: false,
    passed: null
  }));
}

function loadProgress(): ProgressData | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading progress file:', error);
  }
  return null;
}

function saveProgress(progress: ProgressData): void {
  progress.lastUpdated = new Date().toISOString();
  progress.checkedCount = progress.datasets.filter((d) => d.checked).length;
  progress.passedCount = progress.datasets.filter((d) => d.passed === true).length;
  progress.failedCount = progress.datasets.filter((d) => d.passed === false).length;
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function appendFailure(url: string): void {
  fs.appendFileSync(FAILING_DATASETS_FILE, `${url}\n`);
}

async function initializeProgress(): Promise<ProgressData> {
  const existingProgress = loadProgress();

  // Fetch fresh dataset list from API
  const freshDatasets = await fetchDatasetList();

  if (existingProgress) {
    // Merge: keep checked status for datasets that still exist
    const existingMap = new Map(existingProgress.datasets.map((d) => [d.id, d]));
    const mergedDatasets = freshDatasets.map((fresh) => {
      const existing = existingMap.get(fresh.id);
      if (existing) {
        return {
          ...fresh,
          checked: existing.checked,
          passed: existing.passed,
          checkedAt: existing.checkedAt,
          error: existing.error
        };
      }
      return fresh;
    });

    return {
      lastUpdated: new Date().toISOString(),
      totalDatasets: mergedDatasets.length,
      checkedCount: mergedDatasets.filter((d) => d.checked).length,
      passedCount: mergedDatasets.filter((d) => d.passed === true).length,
      failedCount: mergedDatasets.filter((d) => d.passed === false).length,
      datasets: mergedDatasets
    };
  }

  return {
    lastUpdated: new Date().toISOString(),
    totalDatasets: freshDatasets.length,
    checkedCount: 0,
    passedCount: 0,
    failedCount: 0,
    datasets: freshDatasets
  };
}

test.describe('Check All Published Datasets', () => {
  test.skip(MODE !== 'check', 'Skipped: use default mode (no --recheck or --reset flag)');
  test.describe.configure({ mode: 'serial', timeout: FULL_RUN_TIMEOUT_MS });

  let progress: ProgressData;

  test.beforeAll(async () => {
    console.log('Initializing dataset progress...');
    progress = await initializeProgress();
    saveProgress(progress);
    console.log(`Total datasets: ${progress.totalDatasets}`);
    console.log(`Already checked: ${progress.checkedCount}`);
    console.log(`Remaining: ${progress.totalDatasets - progress.checkedCount}`);
  });

  test('Check all published datasets have working filters', async ({ page }) => {
    const uncheckedDatasets = progress.datasets.filter((d) => !d.checked);

    if (uncheckedDatasets.length === 0) {
      console.log('All datasets have already been checked!');
      return;
    }

    console.log(`\nStarting to check ${uncheckedDatasets.length} unchecked datasets...\n`);

    for (let i = 0; i < uncheckedDatasets.length; i++) {
      const dataset = uncheckedDatasets[i];
      const datasetIndex = progress.datasets.findIndex((d) => d.id === dataset.id);

      console.log(`[${i + 1}/${uncheckedDatasets.length}] Checking: ${dataset.title}...`);

      try {
        // Navigate to the dataset page
        await page.goto(dataset.url, { timeout: INITIAL_PAGE_LOAD_TIMEOUT_MS });

        // Wait for the page to load — filters are in collapsed accordions
        const firstAccordion = page.locator('.dimension-accordion__summary').first();
        await expect(firstAccordion).toBeVisible({ timeout: PAGE_RENDER_TIMEOUT_MS });
        // Open the first accordion to access its filter checkboxes
        await firstAccordion.click();
        const filterCheckboxes = page.locator('.filter .govuk-checkboxes__input');
        const checkboxCount = await filterCheckboxes.count();

        if (checkboxCount > 0) {
          // Pick one of the first 5 checkboxes (or fewer if less available)
          const maxIndex = Math.min(5, checkboxCount);
          const selectedIndex = Math.floor(Math.random() * maxIndex);
          const selectedCheckbox = filterCheckboxes.nth(selectedIndex);

          // Check the selected filter checkbox
          await selectedCheckbox.check({ force: true, timeout: 5000 });
        }

        // Click the per-section Apply button
        await page.getByRole('button', { name: 'Apply all selections' }).first().click();

        // Wait for navigation to filtered view
        await page.waitForURL(/\/filtered\//, { timeout: FILTER_APPLY_TIMEOUT_MS });

        // Verify the page renders without errors and displays a data table
        const table = page.locator('table');
        await expect(table).toBeVisible({ timeout: TABLE_RENDER_TIMEOUT_MS });

        // Check there's no error message on the page
        const errorHeading = page.locator('h1:has-text("Error"), h1:has-text("Something went wrong")');
        const hasError = (await errorHeading.count()) > 0;

        if (hasError) {
          throw new Error('Page displayed an error message');
        }

        // Success!
        progress.datasets[datasetIndex].checked = true;
        progress.datasets[datasetIndex].passed = true;
        progress.datasets[datasetIndex].checkedAt = new Date().toISOString();
        console.log(`  ✓ PASSED`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        progress.datasets[datasetIndex].checked = true;
        progress.datasets[datasetIndex].passed = false;
        progress.datasets[datasetIndex].checkedAt = new Date().toISOString();
        progress.datasets[datasetIndex].error = errorMessage;

        // Record failure
        appendFailure(dataset.url);
        console.log(`  ✗ FAILED: ${errorMessage}`);
      }

      // Save progress after each dataset
      saveProgress(progress);

      // Small delay between requests to be gentle on the server
      await page.waitForTimeout(AVOID_RATE_LIMIT_MS);
    }

    // Final summary
    console.log('\n========================================');
    console.log('FINAL SUMMARY');
    console.log('========================================');
    console.log(`Total datasets: ${progress.totalDatasets}`);
    console.log(`Passed: ${progress.passedCount}`);
    console.log(`Failed: ${progress.failedCount}`);
    console.log(`Success rate: ${((progress.passedCount / progress.totalDatasets) * 100).toFixed(1)}%`);

    if (progress.failedCount > 0) {
      console.log(`\nFailed datasets recorded in: ${FAILING_DATASETS_FILE}`);
    }
  });
});

test.describe('Recheck Failed Datasets', () => {
  test.skip(MODE !== 'recheck', 'Skipped: pass --recheck flag to run');
  test.describe.configure({ mode: 'serial', timeout: FULL_RUN_TIMEOUT_MS });

  test('Recheck only previously failed datasets', async ({ page }) => {
    const existingProgress = loadProgress();
    if (!existingProgress) {
      console.log('No progress file found. Run the main test first.');
      return;
    }

    const failedDatasets = existingProgress.datasets.filter((d) => d.passed === false);

    if (failedDatasets.length === 0) {
      console.log('No failed datasets to recheck!');
      return;
    }

    console.log(`\nRechecking ${failedDatasets.length} previously failed datasets...\n`);

    // Reset their status
    for (const dataset of failedDatasets) {
      const index = existingProgress.datasets.findIndex((d) => d.id === dataset.id);
      existingProgress.datasets[index].checked = false;
      existingProgress.datasets[index].passed = null;
      existingProgress.datasets[index].error = undefined;
    }

    saveProgress(existingProgress);

    // Clear the failing datasets file for fresh results
    fs.writeFileSync(FAILING_DATASETS_FILE, `# Recheck started at ${new Date().toISOString()}\n\n`);

    for (let i = 0; i < failedDatasets.length; i++) {
      const dataset = failedDatasets[i];
      const datasetIndex = existingProgress.datasets.findIndex((d) => d.id === dataset.id);

      console.log(`[${i + 1}/${failedDatasets.length}] Rechecking: ${dataset.title}...`);

      try {
        await page.goto(dataset.url, { timeout: INITIAL_PAGE_LOAD_TIMEOUT_MS });

        // Wait for the page to load — filters are in collapsed accordions
        const firstAccordion = page.locator('.dimension-accordion__summary').first();
        await expect(firstAccordion).toBeVisible({ timeout: PAGE_RENDER_TIMEOUT_MS });
        // Open the first accordion to access its filter checkboxes
        await firstAccordion.click();

        const filterCheckboxes = page.locator('.filter .govuk-checkboxes__input');
        const checkboxCount = await filterCheckboxes.count();

        if (checkboxCount > 0) {
          // Pick one of the first 5 checkboxes (or fewer if less available)
          const maxIndex = Math.min(5, checkboxCount);
          const selectedIndex = Math.floor(Math.random() * maxIndex);
          const selectedCheckbox = filterCheckboxes.nth(selectedIndex);
          await selectedCheckbox.check({ force: true, timeout: 5000 });
        }

        await page.getByRole('button', { name: 'Apply all selections' }).first().click();
        await page.waitForURL(/\/filtered\//, { timeout: FILTER_APPLY_TIMEOUT_MS });

        const table = page.locator('table');
        await expect(table).toBeVisible({ timeout: TABLE_RENDER_TIMEOUT_MS });

        const errorHeading = page.locator('h1:has-text("Error"), h1:has-text("Something went wrong")');
        const hasError = (await errorHeading.count()) > 0;

        if (hasError) {
          throw new Error('Page displayed an error message');
        }

        existingProgress.datasets[datasetIndex].checked = true;
        existingProgress.datasets[datasetIndex].passed = true;
        existingProgress.datasets[datasetIndex].checkedAt = new Date().toISOString();
        console.log(`  ✓ PASSED (was previously failing)`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        existingProgress.datasets[datasetIndex].checked = true;
        existingProgress.datasets[datasetIndex].passed = false;
        existingProgress.datasets[datasetIndex].checkedAt = new Date().toISOString();
        existingProgress.datasets[datasetIndex].error = errorMessage;

        appendFailure(dataset.url);
        console.log(`  ✗ STILL FAILING: ${errorMessage}`);
      }

      saveProgress(existingProgress);
      await page.waitForTimeout(AVOID_RATE_LIMIT_MS);
    }

    console.log('\n========================================');
    console.log('RECHECK SUMMARY');
    console.log('========================================');
    const stillFailing = existingProgress.datasets.filter((d) => d.passed === false).length;
    const nowPassing = failedDatasets.length - stillFailing;
    console.log(`Previously failed: ${failedDatasets.length}`);
    console.log(`Now passing: ${nowPassing}`);
    console.log(`Still failing: ${stillFailing}`);
  });
});

test.describe('Reset Progress', () => {
  test.skip(MODE !== 'reset', 'Skipped: pass --reset flag to run');

  test('Reset all progress and start fresh', async () => {
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
      console.log('Progress file deleted.');
    }
    if (fs.existsSync(FAILING_DATASETS_FILE)) {
      fs.unlinkSync(FAILING_DATASETS_FILE);
      console.log('Failing datasets file deleted.');
    }
  });
});
