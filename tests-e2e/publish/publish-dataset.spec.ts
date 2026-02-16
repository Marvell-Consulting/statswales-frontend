import { test, expect } from '../fixtures/test';
import { add } from 'date-fns';
import { nanoid } from 'nanoid';

import {
  assignColumnTypes,
  configureDimension,
  configureMeasure,
  confirmDataTable,
  startNewDataset,
  selectUserGroup,
  provideDatasetTitle,
  uploadDataTable,
  ColumnAssignment,
  configureLookupDimension,
  completeSummary,
  completeCollection,
  completeQuality,
  completeProviders,
  completeRelatedReports,
  completeUpdateFrequency,
  completeDesignation,
  completeTopics,
  completeTranslations,
  completePublicationDate,
  submitForApproval,
  rejectPublication,
  approvePublication,
  downloadFile,
  checkFile
} from './helpers/publishing-steps';

import { Designation } from '../../src/shared/enums/designation';
import { config } from '../../src/shared/config';

const baseUrl = config.frontend.publisher.url;

test.describe('Publish dataset', () => {
  const title = `publish-dataset.spec - ${nanoid(5)}`;
  const nextUpdate = add(new Date(), { years: 1 });
  let datasetId: string;

  const columnAssignments: ColumnAssignment[] = [
    { column: 'YearCode', type: 'Dimension', name: 'Financial year' },
    { column: 'AreaCode', type: 'Dimension', name: 'Area' },
    { column: 'RowRef', type: 'Dimension', name: 'Staff type' },
    { column: 'Data', type: 'Data values' },
    { column: 'Measure', type: 'Measure or data types' },
    { column: 'NoteCodes', type: 'Note codes' }
  ];

  const metadata = {
    summary: 'Dataset summary',
    collection: 'About data collection',
    quality: 'About statistical quality',
    providerName: 'Welsh Government',
    sourceName: 'National Survey for Wales',
    reports: [{ title: 'Related report 1', url: 'https://example.com/report1' }],
    topics: ['Business, economy and labour market', 'Business']
  };

  test.describe('Publisher - new dataset', () => {
    test.use({ role: 'publisher' });

    test('Create new dataset', async ({ page }, testInfo) => {
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);

      await uploadDataTable(page, datasetId, 'realistic/data-orig.csv');
      await confirmDataTable(page, datasetId);
      await assignColumnTypes(page, datasetId, columnAssignments);

      await configureMeasure(page, datasetId, 'realistic/measure.csv');

      await configureDimension(page, datasetId, {
        originalColName: 'YearCode',
        dimensionName: columnAssignments.find((c) => c.column === 'YearCode')!.name!,
        optionSelections: ['Dates', 'Periods', 'Financial', 'YYYYYY', 'Years']
      });

      await configureLookupDimension(page, datasetId, {
        originalColName: 'AreaCode',
        dimensionName: columnAssignments.find((c) => c.column === 'AreaCode')!.name!,
        optionSelections: [],
        filename: 'realistic/area-lookup.csv'
      });

      await configureLookupDimension(page, datasetId, {
        originalColName: 'RowRef',
        dimensionName: columnAssignments.find((c) => c.column === 'RowRef')!.name!,
        optionSelections: [],
        filename: 'realistic/staff-lookup.csv'
      });

      await completeSummary(page, datasetId, metadata.summary);
      await completeCollection(page, datasetId, metadata.collection);
      await completeQuality(page, datasetId, metadata.quality);

      await completeProviders(page, datasetId, metadata.providerName, metadata.sourceName);
      await completeRelatedReports(page, datasetId, metadata.reports);
      await completeDesignation(page, datasetId, Designation.Accredited);
      await completeTopics(page, datasetId, metadata.topics);

      await completeUpdateFrequency(page, datasetId, {
        year: nextUpdate.getFullYear(),
        month: nextUpdate.getMonth() + 1,
        day: nextUpdate.getDate()
      });

      await completeTranslations(page, testInfo, datasetId);
      await completePublicationDate(page, datasetId, 1);
    });

    test('Preview dataset', async ({ page, context }, testInfo) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      const pagePromise = context.waitForEvent('page');
      await page.getByRole('link', { name: 'Preview (opens in new tab)' }).click();
      const previewPage = await pagePromise;
      await expect(previewPage.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/cube-preview`);

      // check contents
      await expect(previewPage.getByText(title)).toBeTruthy();
      await expect(previewPage.getByText('This is a preview of this dataset.')).toBeTruthy();
      await expect(previewPage.getByText('Main information', { exact: true })).toBeTruthy();
      await expect(previewPage.getByText('Overview', { exact: true })).toBeTruthy();
      await expect(previewPage.getByText('Published by', { exact: true })).toBeTruthy();
      await expect(previewPage.getByText(metadata.summary, { exact: true })).toBeTruthy();
      await expect(previewPage.getByText(metadata.collection, { exact: true })).toBeTruthy();
      await expect(previewPage.getByText(metadata.quality, { exact: true })).toBeTruthy();
      await expect(previewPage.getByText(metadata.reports[0].title, { exact: true })).toBeTruthy();

      // download files
      await previewPage.click('#tab_downloads');
      await previewPage.getByRole('button', { name: 'Download data' }).waitFor({ state: 'visible' });
      const csvDownload = await downloadFile(previewPage, previewPage.getByRole('button', { name: 'Download data' }));
      await checkFile(testInfo, csvDownload);
      await previewPage.click('#json', { force: true });
      const jsonDownload = await downloadFile(previewPage, previewPage.getByRole('button', { name: 'Download data' }));
      await checkFile(testInfo, jsonDownload);
      await previewPage.click('#xlsx', { force: true });
      const excelDownload = await downloadFile(previewPage, previewPage.getByRole('button', { name: 'Download data' }));
      await checkFile(testInfo, excelDownload);

      // data table
      await previewPage.click('#tab_data');
      const heading = previewPage.locator('table > thead > tr');
      await expect(heading.getByText('Data Values')).toBeTruthy();
      await expect(heading.getByText('Start Date')).toBeTruthy();
      await expect(heading.getByText('End Date')).toBeTruthy();
      await expect(heading.getByText(columnAssignments.find((c) => c.column === 'YearCode')!.name!)).toBeTruthy();
      await expect(heading.getByText(columnAssignments.find((c) => c.column === 'AreaCode')!.name!)).toBeTruthy();
      await expect(heading.getByText(columnAssignments.find((c) => c.column === 'RowRef')!.name!)).toBeTruthy();
      await expect(heading.getByText('Notes')).toBeTruthy();
    });

    test('Submit dataset for approval', async ({ page }) => {
      await submitForApproval(page, datasetId);
    });
  });

  test.describe(`Publisher - can't edit with open publish request`, () => {
    test.use({ role: 'publisher' });

    test('Redirects to overview when trying to edit', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/summary`);
      await expect(page).toHaveURL(`/en-GB/publish/${datasetId}/overview`);
    });
  });

  test.describe('Approver - publication rejection', () => {
    test.use({ role: 'approver' });

    test('Reject dataset publication', async ({ page }) => {
      await rejectPublication(page, datasetId, 'Testing dataset publication rejection');
    });
  });

  test.describe('Publisher - resubmit', () => {
    test.use({ role: 'publisher' });

    test('Update and resubmit dataset for approval', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await page.getByRole('link', { name: 'Fix issues with dataset' }).click();
      await submitForApproval(page, datasetId);
    });
  });

  test.describe('Approver - publication approval', () => {
    test.use({ role: 'approver' });

    test('Approve dataset publication', async ({ page }) => {
      await approvePublication(page, datasetId);
    });
  });
});
