import { test, expect } from '../fixtures/test';
import { nanoid } from 'nanoid';

import { startNewDataset, selectUserGroup, provideDatasetTitle } from './helpers/publishing-steps';

import { config } from '../../src/shared/config';

const baseUrl = config.frontend.publisher.url;

test.describe('Preview without data table', () => {
  const title = `preview-without-data.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('Publisher - preview error', () => {
    test.use({ role: 'publisher' });

    test('Attempting to preview a dataset without data table shows 404 with error message', async ({ page }) => {
      // Create a new dataset with only a title (no data table uploaded)
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);

      // At this point we're on the upload page, but the dataset has no data table
      // Navigate directly to the cube-preview URL
      const response = await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/cube-preview`);

      // Should return a 404 status and show a 404 page with an error message explaining why
      expect(response?.status()).toBe(404);
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
      await expect(
        page.getByText('You cannot preview this dataset until you have uploaded a data table')
      ).toBeVisible();
    });

    test('Clicking the tasklist preview link before uploading data shows the not-found page', async ({
      page,
      context
    }) => {
      // Create a new dataset, navigate away, then return via the tasklist and use the sidebar link —
      // i.e. the path a user would actually take, not a direct URL hit.
      const altTitle = `${title} - via-tasklist`;
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      const altDatasetId = await provideDatasetTitle(page, altTitle);

      await page.goto(`${baseUrl}/en-GB`);
      await page.goto(`${baseUrl}/en-GB/publish/${altDatasetId}/tasklist`);

      const pagePromise = context.waitForEvent('page');
      await page.getByRole('link', { name: 'Preview (opens in new tab)' }).click();
      const previewPage = await pagePromise;
      await previewPage.waitForLoadState('load');

      expect(previewPage.url()).toContain(`${baseUrl}/en-GB/publish/${altDatasetId}/cube-preview`);
      await expect(previewPage.getByRole('heading', { name: 'Page not found' })).toBeVisible();
      await expect(
        previewPage.getByText('You cannot preview this dataset until you have uploaded a data table')
      ).toBeVisible();
      await previewPage.close();
    });
  });
});
