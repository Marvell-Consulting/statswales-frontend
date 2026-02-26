import { test, expect } from '@playwright/test';

import { resolveDatasetUrlByTitle } from './helpers/find-dataset';
import { CONSUMER_DATASET_TITLE } from '../fixtures/dataset-title';

let datasetUrl: string;

test.beforeAll(async ({ browser }) => {
  datasetUrl = await resolveDatasetUrlByTitle(browser, CONSUMER_DATASET_TITLE);
});

test.describe('Dataset View', () => {
  test('Can view dataset from search', async ({ page }) => {
    await page.goto(datasetUrl);
    // Should show dataset title as h1
    await expect(page.locator('h1.govuk-heading-xl')).toBeVisible();
  });

  test('Shows tab navigation', async ({ page }) => {
    await page.goto(datasetUrl);
    await expect(page.getByRole('tab', { name: 'View data', exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Download data' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Dataset history' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'About this dataset' })).toBeVisible();
  });

  test('Data tab shows table with filters', async ({ page }) => {
    await page.goto(datasetUrl);
    // Data tab should be active by default and show table
    await expect(page.locator('#data_table')).toBeVisible();
    // Should show page size selector
    await expect(page.locator('#page_size')).toBeVisible();
  });

  test('About tab shows dataset information', async ({ page }) => {
    await page.goto(datasetUrl);
    // Click About tab
    await page.getByRole('tab', { name: 'About this dataset' }).click();
    // Should show main information section
    await expect(page.getByRole('heading', { name: 'Main information' })).toBeVisible();
  });

  test('Can switch to Welsh on dataset view', async ({ page }) => {
    await page.goto(datasetUrl);
    await page.getByText('Cymraeg').click();
    // URL should change to Welsh
    await expect(page).toHaveURL(/\/cy/);
  });
});
