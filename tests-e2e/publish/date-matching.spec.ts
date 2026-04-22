import { nanoid } from 'nanoid';

import { Page } from '@playwright/test';

import { test, expect } from '../fixtures/test';
import { config } from '../../src/shared/config';
import {
  assignColumnTypes,
  configureMeasure,
  confirmDataTable,
  provideDatasetTitle,
  selectUserGroup,
  startNewDataset,
  uploadDataTable
} from './helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

// End-to-end coverage of the date-dimension wizard. Two branches:
//   - "Periods" (yearTypeChooser → year-format → period-type → quarter/month):
//     generates FY/QY/MY codes from year-only / year+quarter / year+month data.
//   - "Rolling or overlapping periods of time" (pointInTimeChooser →
//     specific-date-chooser): parses codes like YE20250804 via
//     periodDateTableCreator.
// Tests stop at the date-review preview; they don't complete the dimension
// or populate metadata.

async function startDateDimensionWizard(page: Page, datasetId: string, columnName: string = 'YearCode') {
  await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await page.getByRole('link', { name: columnName, exact: true }).click();
}

async function pickRadioAndContinue(page: Page, label: string | RegExp) {
  // getByLabel is case-insensitive by default, so a string arg like 'mMM'
  // matches 'MMM' too. Use exact for strings; pass a RegExp where case
  // flexibility is required.
  const labelLocator = typeof label === 'string' ? page.getByLabel(label, { exact: true }) : page.getByLabel(label);
  await labelLocator.first().click({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
}

async function expectPeriodReview(page: Page, datasetId: string, dimensionId?: string) {
  const reviewPattern = dimensionId
    ? new RegExp(`/publish/${datasetId}/dates/${dimensionId}/review`)
    : new RegExp(`/publish/${datasetId}/dates/[^/]+/review`);
  await page.waitForURL(reviewPattern, { timeout: 90_000 });
  await expect(page.locator('table tbody tr').first()).toBeVisible();
}

type PeriodShape = 'years' | 'quarters' | 'months';

/**
 * Walk the date-period wizard for a financial year with YYYYYY year codes.
 * `shape` picks the shortest-period radio and, for quarters/months, fills in
 * the required quarter-format + fifth-quarter and (for months) month-format
 * steps.
 */
async function walkFinancialPeriodWizard(page: Page, shape: PeriodShape) {
  await pickRadioAndContinue(page, 'Dates');
  await pickRadioAndContinue(page, 'Periods');
  await pickRadioAndContinue(page, 'Financial');
  await pickRadioAndContinue(page, 'YYYYYY');

  switch (shape) {
    case 'years':
      await pickRadioAndContinue(page, 'Years');
      return;

    case 'quarters':
      await pickRadioAndContinue(page, 'Quarters');
      await page.getByLabel('Qx', { exact: true }).click({ force: true });
      await page.getByLabel('no', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      return;

    case 'months':
      // "Months" → month-format page; picking mMM first submits a patch with
      // only month_format, which fails if the data also contains quarter
      // codes. monthChooser catches the 400 and redirects to the quarter-
      // format page so the user can supply the quarter pattern.
      await pickRadioAndContinue(page, 'Months');
      await pickRadioAndContinue(page, 'mMM');
      await page.getByLabel('Qx', { exact: true }).click({ force: true });
      await page.getByLabel('no', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      return;
  }
}

async function setupPeriodDataset(page: Page, dataFile: string): Promise<string> {
  const title = `date-period - ${nanoid(5)}`;
  await startNewDataset(page);
  await selectUserGroup(page, 'E2E tests');
  const datasetId = await provideDatasetTitle(page, title);
  await uploadDataTable(page, datasetId, `period-ending/${dataFile}`);
  await confirmDataTable(page, datasetId);
  await assignColumnTypes(page, datasetId, [
    { column: 'YearCode', type: 'Dimension' },
    { column: 'AreaCode', type: 'Dimension' },
    { column: 'Value', type: 'Data values' },
    { column: 'Measure', type: 'Measure or data types' },
    { column: 'NoteCodes', type: 'Note codes' }
  ]);
  return datasetId;
}

async function setupRollingCodeDataset(page: Page, dataFile: string, measureFile: string): Promise<string> {
  const title = `rolling-codes - ${nanoid(5)}`;
  await startNewDataset(page);
  await selectUserGroup(page, 'E2E tests');
  const datasetId = await provideDatasetTitle(page, title);
  await uploadDataTable(page, datasetId, `period-ending/${dataFile}`);
  await confirmDataTable(page, datasetId);
  await assignColumnTypes(page, datasetId, [
    { column: 'Data', type: 'Data values' },
    { column: 'Measure', type: 'Measure or data types' },
    { column: 'NoteCodes', type: 'Note codes' },
    { column: 'Date', type: 'Dimension' }
  ]);
  await configureMeasure(page, datasetId, `period-ending/${measureFile}`);
  return datasetId;
}

test.describe('Date dimension — period generation (FY/QY/MY from year codes)', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ role: 'publisher' });

  test('Financial year / years only (data: year codes) matches', async ({ page }) => {
    test.setTimeout(120_000);
    const datasetId = await setupPeriodDataset(page, 'data-years.csv');

    await startDateDimensionWizard(page, datasetId);
    await walkFinancialPeriodWizard(page, 'years');

    await expectPeriodReview(page, datasetId);

    // Descriptions use the '-' separator from yearType() for Financial year.
    const tableText = await page.locator('table tbody').innerText();
    expect(tableText).toContain('2021-22');
    expect(tableText).toContain('2022-23');
    expect(tableText).toContain('2023-24');
  });

  test('Financial year / quarters (data: year + Qx codes) matches', async ({ page }) => {
    test.setTimeout(120_000);
    const datasetId = await setupPeriodDataset(page, 'data-quarters.csv');

    await startDateDimensionWizard(page, datasetId);
    await walkFinancialPeriodWizard(page, 'quarters');

    await expectPeriodReview(page, datasetId);

    const tableText = await page.locator('table tbody').innerText();
    expect(tableText).toContain('2022-23');
    expect(tableText).toMatch(/202223Q[1-4]/);
  });

  test('Financial year / months (data: year + Qx + mMM codes) matches', async ({ page }) => {
    test.setTimeout(120_000);
    const datasetId = await setupPeriodDataset(page, 'data-months.csv');

    await startDateDimensionWizard(page, datasetId);
    await walkFinancialPeriodWizard(page, 'months');

    await expectPeriodReview(page, datasetId);

    const tableText = await page.locator('table tbody').innerText();
    expect(tableText).toContain('2022-23');
    expect(tableText).toMatch(/202223Q[1-4]/);
    expect(tableText).toMatch(/202223m\d{2}/);
  });

  // Regression guard for period-match-failure.jsx: when the backend returns
  // nonMatchingValues (an array of {date_data: ...} objects), the failure view
  // used to render each object as a React child and crash with "Objects are
  // not valid as a React child", dropping the user on a generic 500 page.
  // Force that path by picking Years-only on data that also contains Qx codes.
  test('no_matching_dates renders the failure view with the unmatched codes listed', async ({ page }) => {
    test.setTimeout(120_000);
    const datasetId = await setupPeriodDataset(page, 'data-quarters.csv');

    await startDateDimensionWizard(page, datasetId);
    await walkFinancialPeriodWizard(page, 'years');

    await expect(
      page.getByRole('heading', { name: 'Date formatting cannot be matched to the dimension' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'An unknown error occurred, try again later' })).toHaveCount(0);
    // All 8 unmatched quarter codes should be listed by the view (2 years × 4 quarters).
    await expect(page.getByText(/202[23]2[34]Q[1-4]/)).toHaveCount(8);
  });
});

test.describe('Date dimension — rolling period-ending codes', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ role: 'publisher' });

  test('Rolling codes (YE/QE/ME/...) with YYYYMMDD format matches', async ({ page }) => {
    test.setTimeout(180_000);
    const datasetId = await setupRollingCodeDataset(page, 'data-rolling.csv', 'measure-rolling.csv');

    await startDateDimensionWizard(page, datasetId, 'Date');
    // Dimension-chooser → "Dates"
    await pickRadioAndContinue(page, 'Dates');
    // time-dimension-chooser → "Rolling or overlapping periods of time"
    await pickRadioAndContinue(page, /Rolling or overlapping periods of time/);
    // specific-date-chooser → "YYYYMMDD"
    await pickRadioAndContinue(page, 'YYYYMMDD');

    await expectPeriodReview(page, datasetId);

    // Preview is paginated, so only a sample of rows is rendered. Assert the
    // table contains rolling-format date codes (e.g. `HE20250804`, `3Y20250804`)
    // and that the end-date description resolves to the expected date.
    const tableText = await page.locator('table tbody').innerText();
    expect(tableText).toMatch(/([1-9]Y|XY|YE|HE|QE|ME|FE|WE)20250804/);
    expect(tableText).toContain('4th August 2025');
    // No failure view should have intervened.
    await expect(page.getByRole('heading', { name: /not match|invalid|unknown error/i })).toHaveCount(0);
  });

  // Characterisation test: codes like `YE-2025-08-04` use a dash separator
  // between the 2-char rolling code and the date, which none of the four
  // supported date formats can parse. This test pins current behaviour — if
  // we later add support for a dash-separated format, this assertion flips
  // deliberately.
  test('dash-separated rolling codes surface a match-failure page with recovery links', async ({ page }) => {
    test.setTimeout(180_000);
    const datasetId = await setupRollingCodeDataset(page, 'data-dash-separated.csv', 'measure-dash-separated.csv');

    await startDateDimensionWizard(page, datasetId, 'Date');
    await pickRadioAndContinue(page, 'Dates');
    await pickRadioAndContinue(page, /Rolling or overlapping periods of time/);

    // Closest-fitting format. parseISOasUTC fails on substring(2) = '-2025-08-04'
    // and periodDateTableCreator throws 'Unable to parse date based on supplied
    // format of yyyy-MM-dd.'
    await pickRadioAndContinue(page, 'YYYY-MM-DD');

    await expect(
      page.getByRole('heading', { name: 'Date formatting cannot be matched to the dimension' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'An unknown error occurred, try again later' })).toHaveCount(0);
    // The recovery links point the user at the obvious next actions.
    await expect(page.getByRole('link', { name: /different date formatting/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /different data table/i })).toBeVisible();
  });
});
