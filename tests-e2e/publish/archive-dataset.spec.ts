import { expect, test } from '@playwright/test';
import { nanoid } from 'nanoid';

import { users } from '../fixtures/logins';
import { config } from '../../src/shared/config';
import { publishMinimalDataset } from './helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Archive dataset', () => {
  const title = `archive-dataset.spec - ${nanoid(5)}`;
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

  test.describe('Publisher - request archive', () => {
    test.use({ storageState: users.publisher.path });

    test('Request dataset archiving', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Label dataset as archived' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/archive`);
      await expect(page.getByText('Why should this dataset be labelled as archived?')).toBeVisible();

      const archiveReason = 'No longer updated';
      await page.getByRole('textbox').fill(archiveReason);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Dataset archiving requested').first()).toBeVisible();
    });
  });

  test.describe('Approver - archive approval', () => {
    test.use({ storageState: users.approver.path });

    test('Approve dataset archiving', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);

      await page.getByRole('link', { name: 'Respond to archive request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/task-decision`);

      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Dataset approved for archiving').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Archived dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Published', { exact: true })).toBeVisible();
    });
  });

  test.describe('Publisher - request unarchive', () => {
    test.use({ storageState: users.publisher.path });

    test('Request dataset unarchiving', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);

      await page.getByRole('link', { name: 'Unarchive dataset' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/unarchive`);
      await expect(page.getByText('Why should this dataset be unarchived?')).toBeVisible();

      const unarchiveReason = 'Mistakenly archived';
      await page.getByRole('textbox').fill(unarchiveReason);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Dataset unarchiving requested').first()).toBeVisible();
    });
  });

  test.describe('Approver - unarchive approval', () => {
    test.use({ storageState: users.approver.path });

    test('Approve dataset unarchiving', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Mistakenly archived').first()).toBeVisible();

      await page.getByRole('link', { name: 'Respond to unarchive request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/task-decision`);

      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Dataset approved for unarchiving').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Live dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Published', { exact: true })).toBeVisible();
    });
  });
});
