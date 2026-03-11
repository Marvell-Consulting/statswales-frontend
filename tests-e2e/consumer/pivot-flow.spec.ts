import { test, expect, Page } from '@playwright/test';

import { resolvePivotDatasetUrlByTitle } from './helpers/find-dataset';
import { CONSUMER_DATASET_TITLE } from '../fixtures/dataset-title';

let datasetUrl: string;

test.beforeAll(async ({ browser }) => {
  datasetUrl = await resolvePivotDatasetUrlByTitle(browser, CONSUMER_DATASET_TITLE);
});

async function completePivotFlow(page: Page) {
  await page.goto(datasetUrl);
  await page.click('label[for="tableChoicePivot"]');
  await page.click('#tableChooserBtn');
  await page.locator('#row-column-chooser').locator('label').first().click();
  await page.locator('#column-row-form').locator('button[type="submit"]').click();
  await page.locator('#row-column-chooser').locator('label').first().click();
  await page.locator('#column-row-form').locator('button[type="submit"]').click();
  await page.locator('#pivot-summary-form').locator('button[type="submit"]').click();
}

test.describe('Pivot Flow', () => {
  test.describe('start flow test', () => {
    test('expect flow options to be present', async ({ page }) => {
      await page.goto(datasetUrl);
      await expect(page.locator('label[for="tableChoicePivot"]')).toBeVisible();
      await expect(page.locator('label[for="tableChoiceData"]')).toBeVisible();
    });
  });

  test.describe('All data flow test', () => {
    test('expect selecting view all data to take you to data page', async ({ page }) => {
      await page.goto(datasetUrl);
      await page.click('label[for="tableChoiceData"]');
      await page.click('#tableChooserBtn');
      await expect(page.locator('h1.govuk-heading-xl')).toContainText(CONSUMER_DATASET_TITLE);
      await expect(page).toHaveURL(/data/);
    });

    test('expect clicking on start-over-btn goes to the start', async ({ page }) => {
      await page.goto(datasetUrl);
      await page.click('label[for="tableChoiceData"]');
      await page.click('#tableChooserBtn');
      await expect(page.locator('#start-over-btn')).toBeVisible();
      await page.locator('#start-over-btn').click();
      await expect(page).toHaveURL(/start/);
    });
  });

  test.describe('Pivot flow tests', () => {
    test('Selecting build your own table to take you forward', async ({ page }) => {
      await page.goto(datasetUrl);
      await page.click('label[for="tableChoicePivot"]');
      await page.click('#tableChooserBtn');
      await expect(page.locator('body')).toContainText('Select a variable for the columns of the table');
    });

    test('Selecting first item in columns and clicking continue advances', async ({ page }) => {
      await page.goto(datasetUrl);
      await page.click('label[for="tableChoicePivot"]');
      await page.click('#tableChooserBtn');
      await expect(page.locator('#row-column-chooser').locator('input[type="radio"]')).toHaveCount(4);
      await page.locator('#row-column-chooser').locator('label').first().click();
      await page.locator('#column-row-form').locator('button[type="submit"]').click();
      await expect(page).toHaveURL(/columns/);
    });

    test('Selecting first item in rows and clicking continue advances', async ({ page }) => {
      await page.goto(datasetUrl);
      await page.click('label[for="tableChoicePivot"]');
      await page.click('#tableChooserBtn');
      await page.locator('#row-column-chooser').locator('label').first().click();
      await page.locator('#column-row-form').locator('button[type="submit"]').click();
      await expect(page.locator('#row-column-chooser').locator('input[type="radio"]')).toHaveCount(3);
      await page.locator('#row-column-chooser').locator('label').first().click();
      await page.locator('#column-row-form').locator('button[type="submit"]').click();
      await expect(page).toHaveURL(/columns/);
      await expect(page).toHaveURL(/rows/);
    });

    test('Summary table shows and click continue shows the table', async ({ page }) => {
      await page.goto(datasetUrl);
      await page.click('label[for="tableChoicePivot"]');
      await page.click('#tableChooserBtn');
      await page.locator('#row-column-chooser').locator('label').first().click();
      await page.locator('#column-row-form').locator('button[type="submit"]').click();
      await page.locator('#row-column-chooser').locator('label').first().click();
      await page.locator('#column-row-form').locator('button[type="submit"]').click();
      await expect(page.locator('#pivot-summary-form')).toBeVisible();
      await page.locator('#pivot-summary-form').locator('button[type="submit"]').click();
      await expect(page.locator('.pivot-controls')).toBeVisible();
      await expect(page.locator('#data_table')).toBeVisible();
    });

    test('Clicking on Create new table returns to start', async ({ page }) => {
      await completePivotFlow(page);
      await page.locator('#start-over').click();
      await expect(page.locator('label[for="tableChoicePivot"]')).toBeVisible();
      await expect(page.locator('label[for="tableChoiceData"]')).toBeVisible();
    });

    test('Clicking on show all variables shows data table', async ({ page }) => {
      await completePivotFlow(page);
      await page.locator('#show-data').click();
      await expect(page.locator('#data_table')).toBeVisible();
    });
  });
});
