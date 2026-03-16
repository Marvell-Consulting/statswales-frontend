import { test, expect } from '../fixtures/test';
import { nanoid } from 'nanoid';

import { config } from '../../src/shared/config';
import { publishMinimalDataset, expectConsumerDatasetVisible } from './helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;
const consumerUrl = config.frontend.consumer.url;

test.describe('Archive dataset', () => {
  test.describe.configure({ mode: 'serial' });

  const title = `archive-dataset.spec - ${nanoid(5)}`;
  const replacementTitle = `archive-replacement.spec - ${nanoid(5)}`;
  let datasetId: string;
  let replacementDatasetId: string;

  test.describe('Init test datasets', () => {
    // user with both publisher and approver roles for publishMinimalDataset
    test.use({ role: 'solo' });

    test.beforeAll(async ({ browser, workerUsers }, testInfo) => {
      test.setTimeout(180000); // extend timeout for publishing two datasets
      const context = await browser.newContext({ storageState: workerUsers.solo.path });
      const page = await context.newPage();
      await page.goto(`/en-GB`);
      datasetId = await publishMinimalDataset(page, testInfo, title);
      replacementDatasetId = await publishMinimalDataset(page, testInfo, replacementTitle);
      await page.close();
      await context.close();
    });

    test('Datasets published', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await expect(page.locator('.status-badges').getByText('Published', { exact: true })).toBeVisible();

      await page.goto(`/en-GB/publish/${replacementDatasetId}/overview`);
      await expect(page.locator('.status-badges').getByText('Published', { exact: true })).toBeVisible();
    });
  });

  test.describe('Archive form validation', () => {
    test.use({ role: 'publisher' });

    test('Error when auto-redirect checked without replacement dataset', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/archive`);
      await expect(page.getByText('Why should this dataset be labelled as archived?')).toBeVisible();

      await page.getByRole('textbox').fill('Replaced by newer dataset');
      await page.getByLabel('Automatically redirect visitors').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();

      // should show error about missing replacement dataset
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/archive`);
      await expect(page.getByText('Error')).toBeVisible();
    });
  });

  test.describe('Archive with replacement dataset and auto-redirect', () => {
    test.use({ role: 'publisher' });

    test('Request archive with replacement and auto-redirect', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/archive`);
      await expect(page.getByText('Why should this dataset be labelled as archived?')).toBeVisible();

      await page.getByRole('textbox').fill('Replaced by newer dataset');

      // select replacement dataset via autocomplete
      await page.locator('.autocomplete__input').fill(replacementTitle);
      await page.getByRole('option', { name: new RegExp(replacementTitle) }).click({ force: true });

      // enable auto-redirect
      await page.getByLabel('Automatically redirect visitors').click({ force: true });

      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Dataset archiving requested').first()).toBeVisible();
    });
  });

  test.describe('Approver - archive approval with redirect', () => {
    test.use({ role: 'approver' });

    test('Approve dataset archiving', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);

      // verify replacement info is shown on the overview for approver
      await expect(page.getByText(replacementTitle)).toBeVisible();

      await page.getByRole('link', { name: 'Respond to archive request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/task-decision`);

      // verify replacement info is shown on the decision page
      await expect(page.getByText(replacementTitle)).toBeVisible();

      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${datasetId}/overview`);
      await expect(page.getByText('Dataset approved for archiving').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Archived dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Published', { exact: true })).toBeVisible();
    });
  });

  test.describe('Consumer - auto-redirect', () => {
    test.use({ role: 'solo' });

    test('Consumer is redirected to replacement dataset', async ({ page }) => {
      // navigating to the archived dataset should redirect to the replacement
      await page.goto(`${consumerUrl}/en-GB/${datasetId}`);
      await expect(page.url()).toContain(replacementDatasetId);
      await expect(page.locator('h1.govuk-heading-xl')).toBeVisible();
    });
  });

  test.describe('Publisher - unarchive to test without redirect', () => {
    test.use({ role: 'solo' });

    test('Unarchive dataset', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await page.getByRole('link', { name: 'Unarchive dataset' }).click();
      await page.getByRole('textbox').fill('Re-archiving without redirect');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Dataset unarchiving requested').first()).toBeVisible();

      // approve as same solo user
      await page.getByRole('link', { name: 'Respond to unarchive request' }).click();
      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Dataset approved for unarchiving').first()).toBeVisible();
    });
  });

  test.describe('Archive with replacement but no auto-redirect', () => {
    test.use({ role: 'solo' });

    test('Request and approve archive without auto-redirect', async ({ page }) => {
      await page.goto(`/en-GB/publish/${datasetId}/archive`);

      await page.getByRole('textbox').fill('Replaced but no redirect');

      // select replacement dataset but do NOT check auto-redirect
      await page.locator('.autocomplete__input').fill(replacementTitle);
      await page.getByRole('option', { name: new RegExp(replacementTitle) }).click({ force: true });

      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Dataset archiving requested').first()).toBeVisible();

      // approve
      await page.getByRole('link', { name: 'Respond to archive request' }).click();
      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Dataset approved for archiving').first()).toBeVisible();
    });
  });

  test.describe('Consumer - archive banner with replacement link', () => {
    test.use({ role: 'solo' });

    test('Consumer sees archive banner with replacement link', async ({ page }) => {
      const response = await page.goto(`${consumerUrl}/en-GB/${datasetId}`);
      // should NOT redirect (auto_redirect is false)
      expect(response?.status()).toBe(200);
      await expect(page.url()).toContain(datasetId);

      // should show the archived notification banner with replacement link
      const banner = page.locator('.govuk-notification-banner').first();
      await expect(banner).toBeVisible();
      await expect(banner.getByText('This dataset has been archived')).toBeVisible();
      await expect(banner.getByRole('link', { name: 'View the replacement dataset' })).toBeVisible();

      // clicking the link should navigate to the replacement dataset
      await banner.getByRole('link', { name: 'View the replacement dataset' }).click();
      await expect(page.url()).toContain(replacementDatasetId);
    });
  });

  test.describe('Archive with no replacement dataset', () => {
    test.use({ role: 'solo' });

    test('Unarchive, then archive without replacement', async ({ page }) => {
      // first unarchive
      await page.goto(`/en-GB/publish/${datasetId}/overview`);
      await page.getByRole('link', { name: 'Unarchive dataset' }).click();
      await page.getByRole('textbox').fill('Testing no replacement');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('link', { name: 'Respond to unarchive request' }).click();
      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Dataset approved for unarchiving').first()).toBeVisible();

      // archive without replacement
      await page.getByRole('link', { name: 'Label dataset as archived' }).click();
      await page.getByRole('textbox').fill('No longer updated');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Dataset archiving requested').first()).toBeVisible();

      // approve
      await page.getByRole('link', { name: 'Respond to archive request' }).click();
      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Dataset approved for archiving').first()).toBeVisible();
    });
  });

  test.describe('Consumer - archive banner without replacement', () => {
    test.use({ role: 'solo' });

    test('Consumer sees archive banner without replacement link', async ({ page }) => {
      await expectConsumerDatasetVisible(page, datasetId);

      const banner = page.locator('.govuk-notification-banner').first();
      await expect(banner).toBeVisible();
      await expect(banner.getByText('This dataset has been archived')).toBeVisible();
      // should NOT have a replacement link
      await expect(banner.getByRole('link', { name: 'View the replacement dataset' })).not.toBeVisible();
    });
  });
});
