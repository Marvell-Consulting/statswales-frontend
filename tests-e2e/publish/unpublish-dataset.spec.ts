import { expect, test } from '@playwright/test';
import { add } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { nanoid } from 'nanoid';

import { users } from '../fixtures/logins';
import { config } from '../../src/shared/config';
import { publishMinimalDataset } from './helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Unpublish dataset', () => {
  const title = `unpublish-dataset.spec - ${nanoid(5)}`;
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

  test.describe('Publisher - request unpublish', () => {
    test.use({ storageState: users.publisher.path });

    test('Request dataset be temporarily unpublished', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await page.getByRole('link', { name: 'Temporarily unpublish dataset' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/unpublish`);
      await expect(page.getByText('Why should this dataset be temporarily unpublished?')).toBeVisible();

      const unpublishReason = 'Need to fix a mistake';
      await page.getByRole('textbox').fill(unpublishReason);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Dataset unpublishing requested').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Live dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Unpublish requested', { exact: true })).toBeVisible();
    });
  });

  test.describe('Approver - unpublish approval', () => {
    test.use({ storageState: users.approver.path });

    test('Approve dataset unpublishing', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Need to fix a mistake').first()).toBeVisible();

      await page.getByRole('link', { name: 'Respond to unpublishing request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/task-decision`);

      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Dataset approved for unpublishing').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Offline dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Unpublished', { exact: true })).toBeVisible();
    });
  });

  test.describe('Publisher - request republish', () => {
    test.use({ storageState: users.publisher.path });

    test('Update unpublished dataset and republish', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);

      await page.getByRole('link', { name: 'Update this dataset' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);

      await page.getByRole('link', { name: 'When this update should be published' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/schedule`);

      const now = new TZDate(new Date().toISOString(), 'Europe/London');
      const theFuture = add(now, { minutes: 1 });
      const day = theFuture.getDate();
      const month = theFuture.getMonth() + 1;
      const year = theFuture.getFullYear();
      const hours = theFuture.getHours();
      const mins = theFuture.getMinutes();

      await page.getByRole('textbox', { name: 'Day' }).fill(String(day));
      await page.getByRole('textbox', { name: 'Month' }).fill(String(month));
      await page.getByRole('textbox', { name: 'Year' }).fill(String(year));
      await page.getByRole('textbox', { name: 'Hour' }).fill(String(hours));
      await page.getByRole('textbox', { name: 'Minute' }).fill(String(mins));

      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);

      await page.getByRole('button', { name: 'Submit for approval' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Dataset submitted for approval')).toBeTruthy();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Offline dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Pending approval', { exact: true })).toBeVisible();
    });
  });

  test.describe('Approver - republication approval', () => {
    test.use({ storageState: users.approver.path });

    test('Approve dataset update publication', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);

      await page.getByRole('link', { name: 'Respond to publishing request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/task-decision`);

      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Dataset approved for publishing').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Live dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Update scheduled', { exact: true })).toBeVisible();
    });
  });
});
