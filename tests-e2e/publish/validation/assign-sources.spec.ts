import { test, expect } from '../../fixtures/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import {
  startNewDataset,
  selectUserGroup,
  provideDatasetTitle,
  uploadDataTable,
  confirmDataTable,
  submitColumnTypes,
  ColumnAssignment
} from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Sources page', () => {
  const title = `assign-sources.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('Authed as a publisher', () => {
    test.use({ role: 'publisher' });

    test.beforeAll(async ({ browser, workerUsers }) => {
      const context = await browser.newContext({ storageState: workerUsers.publisher.path });
      const page = await context.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
      await uploadDataTable(page, datasetId, 'minimal/data.csv');
      await page.close();
      await context.close();
    });

    test('Has a heading', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await expect(
        page.getByRole('heading', { name: 'What does each column in the data table contain?' })
      ).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await page.getByText('Cymraeg').click();
      await expect(
        page.getByRole('heading', { name: 'Beth mae pob colofn yn y tabl data yn ei gynnwys?' })
      ).toBeVisible();
    });

    test('Displays an error if no sources are selected', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('There is a problem')).toBeVisible();
      await expect(page.getByText('Select what each column in the data table contains')).toBeVisible();
    });

    test('Displays an error if not all sources are selected', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, [
        { column: 'date', type: 'Dimension' },
        { column: 'data', type: 'Data values' },
        { column: 'measure', type: 'Measure or data types' }
      ]);
      await expect(page.getByText('There is a problem')).toBeVisible();
      await expect(page.getByText('Select what each column in the data table contains')).toBeVisible();
    });

    test('Displays an error if more than one value source is selected', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, [
        { column: 'date', type: 'Data values' },
        { column: 'data', type: 'Data values' },
        { column: 'measure', type: 'Measure or data types' },
        { column: 'notes', type: 'Note codes' }
      ]);
      await expect(page.getByText('There is a problem')).toBeVisible();
      await expect(page.getByText('There should be one column in the data table for data values')).toBeVisible();
    });

    test('Displays an error if more than one notes source is selected', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, [
        { column: 'date', type: 'Note codes' },
        { column: 'data', type: 'Data values' },
        { column: 'measure', type: 'Measure or data types' },
        { column: 'notes', type: 'Note codes' }
      ]);
      await expect(page.getByText('There is a problem')).toBeVisible();
      await expect(page.getByText('There should be one column in the data table for note codes')).toBeVisible();
    });

    test('Displays an error if more than one measure source is selected', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, [
        { column: 'date', type: 'Measure or data types' },
        { column: 'data', type: 'Data values' },
        { column: 'measure', type: 'Measure or data types' },
        { column: 'notes', type: 'Note codes' }
      ]);
      await expect(page.getByText('There is a problem')).toBeVisible();
      await expect(
        page.getByText('There should be one column in the data table for measure or data types')
      ).toBeVisible();
    });

    test('Displays an error if no notes code column is selected', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, [
        { column: 'date', type: 'Dimension' },
        { column: 'data', type: 'Data values' },
        { column: 'measure', type: 'Measure or data types' },
        { column: 'notes', type: 'Dimension' }
      ]);
      await expect(page.getByText('There is a problem')).toBeVisible();
      await expect(page.getByText('There should be one column in the data table for note codes')).toBeVisible();
    });
  });

  test.describe('Not authed', () => {
    // role defaults to null → unauthenticated (no cookies)
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });
});

test.describe('Fact table validation errors', () => {
  const assignments: ColumnAssignment[] = [
    { column: 'date', type: 'Dimension' },
    { column: 'data', type: 'Data values' },
    { column: 'measure', type: 'Measure or data types' },
    { column: 'notes', type: 'Note codes' }
  ];

  test.describe('Duplicate facts', () => {
    test.use({ role: 'publisher' });

    const title = `dupe-fact-validation - ${nanoid(5)}`;
    let datasetId: string;

    test.beforeAll(async ({ browser, workerUsers }) => {
      const context = await browser.newContext({ storageState: workerUsers.publisher.path });
      const page = await context.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
      await uploadDataTable(page, datasetId, 'invalid/dupe-fact.csv');
      await confirmDataTable(page, datasetId);
      await page.close();
      await context.close();
    });

    test('Shows the correct error heading when sources are assigned', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, assignments);
      await expect(page.getByRole('heading', { name: 'Data table has 2 duplicate facts' })).toBeVisible();
    });

    test('Shows the expected action links', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, assignments);
      await expect(page.getByRole('link', { name: 'Change what each column contains' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Replace the data table' })).toBeVisible();
    });
  });

  test.describe('Incomplete facts', () => {
    test.use({ role: 'publisher' });

    const title = `incomplete-fact-validation - ${nanoid(5)}`;
    let datasetId: string;

    test.beforeAll(async ({ browser, workerUsers }) => {
      const context = await browser.newContext({ storageState: workerUsers.publisher.path });
      const page = await context.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
      await uploadDataTable(page, datasetId, 'invalid/incomplete-fact.csv');
      await confirmDataTable(page, datasetId);
      await page.close();
      await context.close();
    });

    test('Shows the correct error heading when sources are assigned', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, assignments);
      await expect(page.getByRole('heading', { name: 'Data table has 1 incomplete facts' })).toBeVisible();
    });

    test('Shows only the replace data table action link', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, assignments);
      await expect(page.getByRole('link', { name: 'Change what each column contains' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Replace the data table' })).toBeVisible();
    });
  });

  test.describe('Bad note codes', () => {
    test.use({ role: 'publisher' });

    const title = `bad-note-codes-validation - ${nanoid(5)}`;
    let datasetId: string;

    test.beforeAll(async ({ browser, workerUsers }) => {
      const context = await browser.newContext({ storageState: workerUsers.publisher.path });
      const page = await context.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
      await uploadDataTable(page, datasetId, 'invalid/bad-note-codes.csv');
      await confirmDataTable(page, datasetId);
      await page.close();
      await context.close();
    });

    test('Shows the correct error heading when sources are assigned', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, assignments);
      await expect(
        page.getByRole('heading', { name: 'Date table has 1 instances of unrecognised note codes' })
      ).toBeVisible();
    });

    test('Shows the expected action links', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await submitColumnTypes(page, assignments);
      await expect(page.getByRole('link', { name: 'Change what each column contains' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Replace the data table' })).toBeVisible();
    });
  });
});
