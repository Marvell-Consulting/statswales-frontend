import fs from 'node:fs/promises';
import path from 'node:path';

import { Download, expect, Locator, Page, TestInfo } from '@playwright/test';
import { escapeRegExp } from 'lodash';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

import { config } from '../../../src/shared/config';
import { Designation } from '../../../src/shared/enums/designation';
import { TranslationDTO } from '../../../src/shared/dtos/translations';
import { TZDate } from '@date-fns/tz';
import { add } from 'date-fns';

const baseUrl = config.frontend.publisher.url;
const consumerUrl = config.frontend.consumer.url;

export async function uploadFile(page: Page, filePath: string) {
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator('input[type="file"]').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filePath);
}

export async function downloadFile(page: Page, downloadButton: Locator) {
  const downloadPromise = page.waitForEvent('download');
  await downloadButton.click();
  return await downloadPromise;
}

export async function checkFile(testInfo: TestInfo, download: Download) {
  const filepath = path.join(testInfo.outputDir, download.suggestedFilename());
  await download.saveAs(filepath);
  const file = await fs.readFile(filepath);
  await expect(file).toBeTruthy();
}

export async function checkTasklistItemComplete(page: Page, name: string | RegExp, isUpdate: boolean = false) {
  const link = await page.getByRole('link', { name });
  const taskItem = await page.getByRole('listitem').filter({ has: link });
  await expect(taskItem).toContainText(isUpdate ? 'Updated' : 'Completed');
}

export async function startNewDataset(page: Page) {
  await page.goto('/en-GB');
  await page.getByRole('link', { name: 'Create new dataset' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish`);
  await page.getByRole('link', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/group`);
}

export async function selectUserGroup(page: Page, groupName: string) {
  await page.getByText(groupName, { exact: true }).click({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/title`);
}

export async function provideDatasetTitle(page: Page, title: string): Promise<string> {
  await page.getByRole('textbox').fill(title);
  await page.getByRole('button', { name: 'Continue' }).click();
  const pageUrl = page.url();
  const match = pageUrl.match(new RegExp(`^${escapeRegExp(baseUrl)}/en-GB/publish/(.*)/upload$`));
  const datasetId = match?.[1];
  await expect(pageUrl).toContain(`${baseUrl}/en-GB/publish/${datasetId}/upload`);
  return datasetId || '';
}

export async function uploadDataTable(page: Page, datasetId: string, filename: string) {
  const filePath = path.join(__dirname, '..', '..', 'sample-csvs', filename);
  await uploadFile(page, filePath);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/preview`);
}

export async function uploadInvalidDataTable(page: Page, filename: string) {
  const filePath = path.join(__dirname, '..', '..', 'sample-csvs', filename);
  await uploadFile(page, filePath);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForLoadState('networkidle');
}

export async function confirmDataTable(page: Page, datasetId: string) {
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
}

export type ColumnAssignment = {
  column: string;
  type: 'Dimension' | 'Data values' | 'Measure or data types' | 'Note codes';
  name?: string;
};

export async function assignColumnTypes(page: Page, datasetId: string, assignments: ColumnAssignment[]) {
  for (const assignment of assignments) {
    await page.getByLabel(assignment.column).selectOption(assignment.type);
  }

  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Data table');
}

export async function submitColumnTypes(page: Page, assignments: ColumnAssignment[]) {
  for (const assignment of assignments) {
    await page.getByLabel(assignment.column).selectOption(assignment.type);
  }
  await page.getByRole('button', { name: /Continue|Parhau/ }).click();
  await page.waitForLoadState('networkidle');
}

export async function configureMeasure(page: Page, datasetId: string, filename: string) {
  await page.getByRole('link', { name: 'Measure' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/measure`);

  const filePath = path.join(__dirname, '..', '..', 'sample-csvs', filename);
  await uploadFile(page, filePath);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL(`${baseUrl}/en-GB/publish/${datasetId}/measure/review`);
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/measure/review`);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Data description');
}

export type DimensionConfig = {
  originalColName: string;
  dimensionName: string;
  optionSelections: string[];
  filename?: string;
};

export async function configureDimension(page: Page, datasetId: string, dimensionConfig: DimensionConfig) {
  await page.getByRole('link', { name: dimensionConfig.originalColName, exact: true }).click();

  for (const option of dimensionConfig.optionSelections) {
    await page.getByLabel(option).first().click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox').fill(dimensionConfig.dimensionName);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await expect(page.getByText(dimensionConfig.dimensionName)).toBeVisible();
  await checkTasklistItemComplete(page, dimensionConfig.dimensionName);
}

export async function configureLookupDimension(page: Page, datasetId: string, dimensionConfig: DimensionConfig) {
  await page.getByRole('link', { name: dimensionConfig.originalColName }).click();
  await page.getByLabel('Something else').click({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();

  const filePath = path.join(__dirname, '..', '..', 'sample-csvs', dimensionConfig.filename!);
  await uploadFile(page, filePath);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox').fill(dimensionConfig.dimensionName);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await expect(page.getByText(dimensionConfig.dimensionName)).toBeVisible();
  await checkTasklistItemComplete(page, dimensionConfig.dimensionName);
}

export async function completeMetadata(page: Page, section: string, text: string) {
  await page.getByRole('link', { name: section }).click();
  await page.getByRole('textbox').fill(text);
}

export async function completeSummary(page: Page, datasetId: string, text: string, isUpdate = false) {
  await completeMetadata(page, 'Summary of dataset', text);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Summary', isUpdate);
}

export async function completeCollection(page: Page, datasetId: string, text: string, isUpdate = false) {
  await completeMetadata(page, 'Data collection', text);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Data collection', isUpdate);
}

export async function completeQuality(
  page: Page,
  datasetId: string,
  text: string,
  rounding?: { applied: boolean; description?: string },
  isUpdate = false
) {
  await completeMetadata(page, 'Statistical quality', text);
  if (rounding?.applied) {
    await page.getByLabel('Yes').click({ force: true });
    if (rounding.description) {
      await page.locator('#roundingDescription').fill(rounding.description);
    }
  } else {
    await page.getByLabel('No').click({ force: true });
  }
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Statistical quality', isUpdate);
}

export async function completeProviders(
  page: Page,
  datasetId: string,
  providerName: string,
  sourceName?: string,
  isUpdate = false
) {
  await page.getByRole('link', { name: 'Data sources' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/providers`);
  await page.locator('.autocomplete__wrapper').click();
  await page.locator('.autocomplete__input').fill(providerName);
  await page.getByRole('option', { name: providerName }).click({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/providers?edit`);
  if (sourceName) {
    await page.getByLabel('Select source').first().click({ force: true });
    await page.locator('.autocomplete__wrapper').click();
    await page.locator('.autocomplete__input').fill(sourceName);
    await page.getByRole('option', { name: sourceName }).click({ force: true });
  } else {
    await page.getByLabel('No specific source from data provider').click({ force: true });
  }
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/providers`);
  await page.getByLabel('No').click({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Data sources', isUpdate);
}

export type RelatedReport = {
  title: string;
  url: string;
};

export async function completeRelatedReports(
  page: Page,
  datasetId: string,
  reports: RelatedReport[],
  isUpdate = false
) {
  await page.getByRole('link', { name: 'Related reports' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/related`);

  for (const [index, report] of reports.entries()) {
    if (index > 0) {
      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
    }
    await page.getByRole('textbox', { name: 'Link URL' }).fill(report.url);
    await page.getByRole('textbox', { name: 'Link text to appear on the webpage' }).fill(report.title);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/related`);
  }

  await page.getByLabel('No').click({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Related reports', isUpdate);
}

export async function completeUpdateFrequency(
  page: Page,
  datasetId: string,
  frequency?: Record<string, number>,
  isUpdate = false
) {
  await page.getByRole('link', { name: 'If this dataset will be updated or replaced in the future' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/update-frequency`);

  if (frequency) {
    await page.getByLabel('An update is expected').click({ force: true });
    await page.getByRole('textbox', { name: 'Day' }).fill(String(frequency.day));
    await page.getByRole('textbox', { name: 'Month' }).fill(String(frequency.month));
    await page.getByRole('textbox', { name: 'Year' }).fill(String(frequency.year));
  } else {
    await page.getByLabel('This dataset is not expected to be updated').click({ force: true });
  }
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'If this dataset will be updated', isUpdate);
}

export async function completeDesignation(page: Page, datasetId: string, designation: Designation, isUpdate = false) {
  await page.getByRole('link', { name: 'Designation' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/designation`);
  await page.locator(`input[value="${designation}"]`).click({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Designation', isUpdate);
}

export async function completeTopics(page: Page, datasetId: string, topics: string[], isUpdate = false) {
  await page.getByRole('link', { name: 'Relevant topics' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/topics`);

  for (const topic of topics) {
    await page.getByLabel(topic, { exact: true }).click({ force: true });
  }

  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Relevant topics', isUpdate);
}

export async function completeUpdateReason(page: Page, datasetId: string, text: string) {
  await completeMetadata(page, 'Update notes', text);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Update notes');
}

export async function completeTranslations(page: Page, testInfo: TestInfo, datasetId: string) {
  await page.getByRole('link', { name: 'Export text fields for translation' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/translation/export`);

  const downloadButton = page.getByRole('link', { name: 'Export CSV' });
  const download = await downloadFile(page, downloadButton);
  const translationFilePath = path.join(testInfo.outputDir, download.suggestedFilename());
  await download.saveAs(translationFilePath);
  await page.goto(`/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Export text fields for translation');

  // update the downloaded translation csv with new values for Welsh
  const file = await fs.readFile(translationFilePath);
  const parsed = parse<TranslationDTO>(file, { columns: true, bom: true });

  const mapped = parsed.map((row: TranslationDTO): TranslationDTO => {
    return { ...row, cymraeg: `${row.english} - CY` };
  });

  const newCsv = stringify(mapped, { columns: Object.keys(parsed[0]), header: true });
  await fs.writeFile(translationFilePath, newCsv);

  // import the updated translation csv
  await page.getByRole('link', { name: 'Import translations' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/translation/import`);
  await uploadFile(page, translationFilePath);
  await page.getByRole('button', { name: 'Import CSV' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/translation/import`);
  await expect(page.getByRole('heading')).toContainText('Check the translated text');
  await page.getByRole('link', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Import translations');
}

export async function completePublicationDate(page: Page, datasetId: string, minutesFromNow: number) {
  await page.getByRole('link', { name: /When this (dataset|update) should be published/ }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/schedule`);

  const now = new TZDate(new Date().toISOString(), 'Europe/London');
  const theFuture = add(now, { minutes: minutesFromNow });

  await page.getByRole('textbox', { name: 'Day' }).fill(String(theFuture.getDate()));
  await page.getByRole('textbox', { name: 'Month' }).fill(String(theFuture.getMonth() + 1));
  await page.getByRole('textbox', { name: 'Year' }).fill(String(theFuture.getFullYear()));
  await page.getByRole('textbox', { name: 'Hour' }).fill(String(theFuture.getHours()));
  await page.getByRole('textbox', { name: 'Minute' }).fill(String(theFuture.getMinutes()));

  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, /When this (dataset|update) should be published/);
}

export async function submitForApproval(page: Page, datasetId: string) {
  await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await page.getByRole('button', { name: 'Submit for approval' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
  await expect(page.getByText('Dataset submitted for approval')).toBeTruthy();
}

export async function rejectPublication(page: Page, datasetId: string, reason: string) {
  await page.goto(`/en-GB/publish/${datasetId}/overview`);
  await page.getByRole('link', { name: 'Respond to publishing request' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/task-decision`);

  await page.getByLabel('No').click({ force: true });
  await page.getByRole('textbox').fill(reason);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
  await expect(page.getByText('Dataset was not approved for publishing').first()).toBeVisible();
  await expect(page.getByText(reason).first()).toBeVisible();
}

export async function approvePublication(page: Page, datasetId: string) {
  await page.goto(`/en-GB/publish/${datasetId}/overview`);
  await page.getByRole('link', { name: 'Respond to publishing request' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/task-decision`);

  await page.getByLabel('Yes').click({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
  await expect(page.getByText('Dataset approved for publishing').first()).toBeVisible();
}

export async function waitForPublication(page: Page, datasetId: string) {
  await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/overview`);

  const statusBadges = page.locator('.status-badges');
  let isPublished = false;

  while (!isPublished) {
    await page.waitForTimeout(5000); // refresh page every 5 seconds until the dataset is published
    await page.reload();
    isPublished = await statusBadges.getByText('Published').isVisible();
  }
}

// needs to be called using a login with both publisher and approver roles (e.g. test_solo_1)
export async function publishMinimalDataset(
  page: Page,
  testInfo: TestInfo,
  title: string,
  meta?: Record<string, any>
): Promise<string> {
  await startNewDataset(page);
  await selectUserGroup(page, 'E2E tests');
  const datasetId = await provideDatasetTitle(page, title);

  await uploadDataTable(page, datasetId, 'minimal/data.csv');
  await confirmDataTable(page, datasetId);

  await assignColumnTypes(page, datasetId, [
    { column: 'date', type: 'Dimension' },
    { column: 'data', type: 'Data values' },
    { column: 'measure', type: 'Measure or data types' },
    { column: 'notes', type: 'Note codes' }
  ]);

  await configureMeasure(page, datasetId, 'minimal/measure.csv');
  await configureDimension(page, datasetId, {
    originalColName: 'date',
    optionSelections: ['Dates', 'Periods', 'Calendar', 'Years'],
    dimensionName: 'Year'
  });

  const metadata = meta || {
    summary: 'Summary',
    collection: 'Collection',
    quality: 'Quality',
    providerName: 'Welsh Government',
    sourceName: 'National Survey for Wales',
    reports: [{ title: 'Related report 1', url: 'https://example.com/report1' }],
    topics: ['Welsh language']
  };

  await completeSummary(page, datasetId, metadata.summary);
  await completeCollection(page, datasetId, metadata.collection);
  await completeQuality(page, datasetId, metadata.quality);
  await completeProviders(page, datasetId, metadata.providerName, metadata.sourceName);
  await completeRelatedReports(page, datasetId, metadata.reports);
  await completeDesignation(page, datasetId, Designation.Accredited);
  await completeTopics(page, datasetId, metadata.topics);

  const nextUpdate = add(new Date(), { years: 1 });

  await completeUpdateFrequency(page, datasetId, {
    year: nextUpdate.getFullYear(),
    month: nextUpdate.getMonth() + 1,
    day: nextUpdate.getDate()
  });

  await completeTranslations(page, testInfo, datasetId);
  await completePublicationDate(page, datasetId, 1);

  await submitForApproval(page, datasetId);
  await approvePublication(page, datasetId);
  await waitForPublication(page, datasetId);

  return datasetId;
}

export async function expectConsumerDatasetNotFound(page: Page, datasetId: string) {
  const response = await page.goto(`${consumerUrl}/en-GB/${datasetId}`);
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1.govuk-heading-xl')).toHaveText('Page not found');
}

export async function expectConsumerDatasetVisible(page: Page, datasetId: string) {
  const response = await page.goto(`${consumerUrl}/en-GB/${datasetId}`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1.govuk-heading-xl')).toBeVisible();
}

export async function getConsumerDatasetSummary(page: Page, datasetId: string): Promise<string> {
  await page.goto(`${consumerUrl}/en-GB/${datasetId}`);
  await page.getByRole('tab', { name: 'About this dataset' }).click();
  return await page.locator('#summary .govuk-summary-list__value').innerText();
}

export async function getConsumerDataTableText(page: Page, datasetId: string): Promise<string> {
  await page.goto(`${consumerUrl}/en-GB/${datasetId}`);
  await expect(page.locator('#data_table')).toBeVisible();
  return await page.locator('#data_table').innerText();
}

// needs to be called using a login with both publisher and approver roles (e.g. test_solo_1)
export async function publishRealisticDataset(
  page: Page,
  testInfo: TestInfo,
  title: string,
  meta?: Record<string, any>
): Promise<string> {
  await startNewDataset(page);
  await selectUserGroup(page, 'E2E tests');
  const datasetId = await provideDatasetTitle(page, title);

  await uploadDataTable(page, datasetId, 'realistic/data-orig.csv');
  await confirmDataTable(page, datasetId);

  await assignColumnTypes(page, datasetId, [
    { column: 'YearCode', type: 'Dimension' },
    { column: 'AreaCode', type: 'Dimension' },
    { column: 'RowRef', type: 'Dimension' },
    { column: 'Data', type: 'Data values' },
    { column: 'Measure', type: 'Measure or data types' },
    { column: 'NoteCodes', type: 'Note codes' }
  ]);

  await configureMeasure(page, datasetId, 'realistic/measure.csv');

  await configureDimension(page, datasetId, {
    originalColName: 'YearCode',
    dimensionName: 'Financial year',
    optionSelections: ['Dates', 'Periods', 'Financial', 'YYYYYY', 'Years']
  });

  await configureLookupDimension(page, datasetId, {
    originalColName: 'AreaCode',
    dimensionName: 'Area',
    optionSelections: [],
    filename: 'realistic/area-lookup.csv'
  });

  await configureLookupDimension(page, datasetId, {
    originalColName: 'RowRef',
    dimensionName: 'Staff type',
    optionSelections: [],
    filename: 'realistic/staff-lookup.csv'
  });

  const metadata = meta || {
    summary: 'Realistic dataset for consumer e2e tests',
    collection: 'Collection',
    quality: 'Quality',
    providerName: 'Welsh Government',
    sourceName: 'National Survey for Wales',
    reports: [{ title: 'Related report 1', url: 'https://example.com/report1' }],
    topics: ['Welsh language']
  };

  await completeSummary(page, datasetId, metadata.summary);
  await completeCollection(page, datasetId, metadata.collection);
  await completeQuality(page, datasetId, metadata.quality);
  await completeProviders(page, datasetId, metadata.providerName, metadata.sourceName);
  await completeRelatedReports(page, datasetId, metadata.reports);
  await completeDesignation(page, datasetId, Designation.Accredited);
  await completeTopics(page, datasetId, metadata.topics);

  const nextUpdate = add(new Date(), { years: 1 });

  await completeUpdateFrequency(page, datasetId, {
    year: nextUpdate.getFullYear(),
    month: nextUpdate.getMonth() + 1,
    day: nextUpdate.getDate()
  });

  await completeTranslations(page, testInfo, datasetId);
  await completePublicationDate(page, datasetId, 1);

  await submitForApproval(page, datasetId);
  await approvePublication(page, datasetId);
  await waitForPublication(page, datasetId);

  return datasetId;
}

export async function updateAddNewDataUpload(page: Page, datasetId: string) {
  await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
  await page.getByRole('link', { name: 'Data table' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/update-type`);
  await page.getByText('Add new data only', { exact: true }).click({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/upload`);
}

// Publishes a minimal dataset whose Year dimension uses slash-format values (e.g. "2016/17")
// via a custom lookup table. Used to test that filter checkboxes with encoded slash values
// (stored as "%2F" in the HTML attribute) correctly reflect their checked state after filtering.
export async function publishCustomYearDataset(page: Page, testInfo: TestInfo, title: string): Promise<string> {
  await startNewDataset(page);
  await selectUserGroup(page, 'E2E tests');
  const datasetId = await provideDatasetTitle(page, title);

  await uploadDataTable(page, datasetId, 'custom-year/data.csv');
  await confirmDataTable(page, datasetId);

  await assignColumnTypes(page, datasetId, [
    { column: 'Year', type: 'Dimension' },
    { column: 'Value', type: 'Data values' },
    { column: 'Measure', type: 'Measure or data types' },
    { column: 'NotesCode', type: 'Note codes' }
  ]);

  await configureMeasure(page, datasetId, 'custom-year/measure.csv');

  await configureLookupDimension(page, datasetId, {
    originalColName: 'Year',
    dimensionName: 'Period',
    optionSelections: [],
    filename: 'custom-year/year-lookup.csv'
  });

  await completeSummary(page, datasetId, 'Slash year dataset for filter regression testing');
  await completeCollection(page, datasetId, 'Test data collection');
  await completeQuality(page, datasetId, 'Test statistical quality');
  await completeProviders(page, datasetId, 'Welsh Government');
  await completeRelatedReports(page, datasetId, [{ title: 'Related report 1', url: 'https://example.com/report1' }]);
  await completeDesignation(page, datasetId, Designation.Accredited);
  await completeTopics(page, datasetId, ['Welsh language']);

  const nextUpdate = add(new Date(), { years: 1 });
  await completeUpdateFrequency(page, datasetId, {
    year: nextUpdate.getFullYear(),
    month: nextUpdate.getMonth() + 1,
    day: nextUpdate.getDate()
  });

  await completeTranslations(page, testInfo, datasetId);
  await completePublicationDate(page, datasetId, 1);

  await submitForApproval(page, datasetId);
  await approvePublication(page, datasetId);
  await waitForPublication(page, datasetId);

  return datasetId;
}
