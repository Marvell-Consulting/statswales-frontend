import { test, expect } from '../fixtures/test';
import { nanoid } from 'nanoid';

import {
  approvePublication,
  assignColumnTypes,
  completeSummary,
  completeCollection,
  completeQuality,
  completeProviders,
  completeRelatedReports,
  completeDesignation,
  completeTopics,
  completeUpdateFrequency,
  completeTranslations,
  completePublicationDate,
  completeUpdateReason,
  configureDimension,
  configureMeasure,
  confirmDataTable,
  expectConsumerDatasetNotFound,
  expectConsumerDatasetVisible,
  getConsumerDatasetSummary,
  getConsumerDataTableText,
  publishMinimalDataset,
  startNewDataset,
  selectUserGroup,
  provideDatasetTitle,
  submitForApproval,
  uploadDataTable,
  waitForPublication
} from './helpers/publishing-steps';

import { Designation } from '../../src/shared/enums/designation';
import { add } from 'date-fns';

test.describe('Unpublished datasets are not visible to consumers', () => {
  test.describe('New dataset lifecycle', () => {
    test.use({ role: 'solo' });

    const title = `consumer-visibility.spec new - ${nanoid(5)}`;
    let datasetId: string;

    test('Draft dataset is not visible on consumer site', async ({ page }, testInfo) => {
      // Create dataset and complete all metadata but do NOT submit
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);

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

      await completeSummary(page, datasetId, 'Summary');
      await completeCollection(page, datasetId, 'Collection');
      await completeQuality(page, datasetId, 'Quality');
      await completeProviders(page, datasetId, 'Welsh Government', 'National Survey for Wales');
      await completeRelatedReports(page, datasetId, [{ title: 'Report', url: 'https://example.com' }]);
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

      // Dataset is in draft - consumer should get 404
      await expectConsumerDatasetNotFound(page, datasetId);
    });

    test('Submitted dataset is not visible on consumer site', async ({ page }) => {
      await submitForApproval(page, datasetId);

      // Dataset is pending approval - consumer should get 404
      await expectConsumerDatasetNotFound(page, datasetId);
    });

    test('Approved but scheduled dataset is not visible on consumer site', async ({ page }) => {
      // Approve (publishAt was set ~3 minutes in the future)
      await approvePublication(page, datasetId);

      // Dataset is approved but publish date hasn't passed - consumer should get 404
      await expectConsumerDatasetNotFound(page, datasetId);
    });

    test('Dataset becomes visible after publish date passes', async ({ page }) => {
      test.setTimeout(120000);
      await waitForPublication(page, datasetId);

      // Dataset is now published - consumer should see it
      await expectConsumerDatasetVisible(page, datasetId);
      await expect(page.locator('h1.govuk-heading-xl')).toContainText(title);
    });
  });

  test.describe('Dataset update lifecycle', () => {
    test.use({ role: 'solo' });

    const title = `consumer-visibility.spec update - ${nanoid(5)}`;
    const originalSummary = 'Original summary for visibility test';
    const updatedSummary = 'Updated summary for visibility test';
    let datasetId: string;

    test.beforeAll(async ({ browser, workerUsers }, testInfo) => {
      test.setTimeout(120000);
      const context = await browser.newContext({ storageState: workerUsers.solo.path });
      const page = await context.newPage();
      await page.goto('/en-GB');
      datasetId = await publishMinimalDataset(page, testInfo, title, {
        summary: originalSummary,
        collection: 'Collection',
        quality: 'Quality',
        providerName: 'Welsh Government',
        sourceName: 'National Survey for Wales',
        reports: [{ title: 'Report', url: 'https://example.com' }],
        topics: ['Welsh language']
      });
      await page.close();
      await context.close();
    });

    test('Published dataset shows original data and metadata on consumer site', async ({ page }) => {
      const summary = await getConsumerDatasetSummary(page, datasetId);
      expect(summary).toContain(originalSummary);

      const tableText = await getConsumerDataTableText(page, datasetId);
      expect(tableText).toContain('2015');
      expect(tableText).not.toContain('2016');
    });

    test('Start update with new metadata', async ({ page }, testInfo) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await page.getByRole('link', { name: 'Update this dataset' }).click();

      // Upload new data
      await page.getByRole('link', { name: 'Data table' }).click();
      await page.getByText('Add new data only', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await uploadDataTable(page, datasetId, 'minimal/update.csv');
      await page.getByRole('button', { name: 'Continue' }).click();

      // Update the summary metadata
      await completeSummary(page, datasetId, updatedSummary, true);
      await completeUpdateReason(page, datasetId, 'Updating data and metadata.');
      await completeTranslations(page, testInfo, datasetId);
      await completePublicationDate(page, datasetId, 1);

      // Consumer should still show original data and metadata
      const summary = await getConsumerDatasetSummary(page, datasetId);
      expect(summary).toContain(originalSummary);

      const tableText = await getConsumerDataTableText(page, datasetId);
      expect(tableText).toContain('2015');
      expect(tableText).not.toContain('2016');
    });

    test('Submitted update does not change consumer view', async ({ page }) => {
      await submitForApproval(page, datasetId);

      // Consumer should still show original data and metadata
      const summary = await getConsumerDatasetSummary(page, datasetId);
      expect(summary).toContain(originalSummary);

      const tableText = await getConsumerDataTableText(page, datasetId);
      expect(tableText).toContain('2015');
      expect(tableText).not.toContain('2016');
    });

    test('Approved but scheduled update does not change consumer view', async ({ page }) => {
      await approvePublication(page, datasetId);

      // Consumer should still show original data and metadata (update is scheduled)
      const summary = await getConsumerDatasetSummary(page, datasetId);
      expect(summary).toContain(originalSummary);

      const tableText = await getConsumerDataTableText(page, datasetId);
      expect(tableText).toContain('2015');
      expect(tableText).not.toContain('2016');
    });

    test('Consumer shows updated data and metadata after publish date passes', async ({ page }) => {
      test.setTimeout(120000);
      await waitForPublication(page, datasetId);

      // Consumer should now show updated data and metadata
      const summary = await getConsumerDatasetSummary(page, datasetId);
      expect(summary).toContain(updatedSummary);

      const tableText = await getConsumerDataTableText(page, datasetId);
      expect(tableText).toContain('2016');
    });
  });
});
