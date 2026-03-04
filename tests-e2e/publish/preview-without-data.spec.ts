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
  });
});
