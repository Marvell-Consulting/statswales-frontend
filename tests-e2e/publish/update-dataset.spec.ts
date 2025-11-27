import { expect, test } from '@playwright/test';
import { nanoid } from 'nanoid';

import { users } from '../fixtures/logins';
import { config } from '../../src/shared/config';
import {
  approvePublication,
  completePublicationDate,
  completeTranslations,
  completeUpdateReason,
  publishMinimalDataset,
  rejectPublication,
  submitForApproval,
  uploadDataTable
} from './helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Update dataset', () => {
  const title = `update-dataset.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('Init test dataset', () => {
    // user with both publisher and approver roles for publishMinimalDataset
    test.use({ storageState: users.solo.path });

    test.beforeAll(async ({ browser }, testInfo) => {
      test.setTimeout(90000); // extend timeout to 90s for dataset publishing
      const page = await browser.newPage();
      await page.goto(`/en-GB`);
      datasetId = await publishMinimalDataset(page, testInfo, title);
    });

    test('Dataset published', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await expect(page.locator('.status-badges').getByText('Published', { exact: true })).toBeVisible();
    });
  });

  test.describe('Publisher - dataset update', () => {
    test.use({ storageState: users.publisher.path });

    test('Start the update', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await page.getByRole('link', { name: 'Update this dataset' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
    });

    test('Update the dataset', async ({ page }, testInfo) => {
      await page.goto(`/en-GB/publish/${datasetId}/tasklist`);
      await page.getByRole('link', { name: 'Data table' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/update-type`);

      await page.getByText('Add new data only', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();

      await uploadDataTable(page, datasetId, 'minimal/update.csv');
      await page.getByRole('button', { name: 'Continue' }).click();

      const tasklistItem = await page.locator('li', { hasText: 'Data table' });
      await expect(tasklistItem.locator('.govuk-tag').first()).toHaveText('Updated');

      await completeUpdateReason(page, datasetId, 'Adding new data for the latest period.');
      await completeTranslations(page, testInfo, datasetId);
      await completePublicationDate(page, datasetId, 1);
    });

    test('Submit dataset for approval', async ({ page }) => {
      await submitForApproval(page, datasetId);
    });
  });

  test.describe('Approver - publication rejection', () => {
    test.use({ storageState: users.approver.path });

    test('Reject dataset update', async ({ page }) => {
      await rejectPublication(page, datasetId, 'Testing dataset update rejection');
    });
  });

  test.describe('Publisher - resubmit', () => {
    test.use({ storageState: users.publisher.path });

    test('Update and resubmit dataset for approval', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await page.getByRole('link', { name: 'Fix issues with dataset' }).click();
      await submitForApproval(page, datasetId);
    });
  });

  test.describe('Approver - publication approval', () => {
    test.use({ storageState: users.approver.path });

    test('Approve dataset update', async ({ page }) => {
      await approvePublication(page, datasetId);
    });
  });
});
