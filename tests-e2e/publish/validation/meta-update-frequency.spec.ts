import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Update Frequency', () => {
  const title = `meta-update-frequency.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
    });

    test('Has a heading', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/update-frequency`);
      await expect(
        page.getByRole('heading', { name: 'Will this dataset be updated or replaced in the future?' })
      ).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/update-frequency`);
      await page.getByText('Cymraeg').click();
      await expect(
        page.getByRole('heading', {
          name: 'A fydd y set ddata hon yn cael ei diweddaru neu’n cael ei disodli yn y dyfodol?'
        })
      ).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/update-frequency`);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/update-frequency`);
        await expect(
          page.getByText('Select whether this dataset will be updated or replaced in the future').first()
        ).toBeVisible();
      });

      test('Displays a validation error when update is expected but update year is missing', async ({ page }) => {
        await page.getByText('An update is expected', { exact: true }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/update-frequency`);
        await expect(page.getByText('The date the next update is expected must include a year').first()).toBeVisible();
      });

      test('Displays a validation error when update is expected but update year is in the past', async ({ page }) => {
        await page.getByText('An update is expected', { exact: true }).click();
        await page.getByLabel('Year').fill('2010');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/update-frequency`);
        await expect(
          page.getByText('The date the next update is expected must be a real date in the future').first()
        ).toBeVisible();
      });

      test('Displays a validation error when update is expected but update is an invalid date', async ({ page }) => {
        await page.getByText('An update is expected', { exact: true }).click();
        await page.getByLabel('Day').fill('30');
        await page.getByLabel('Month').fill('02');
        await page.getByLabel('Year').fill('2026');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/update-frequency`);
        await expect(
          page.getByText('The date the next update is expected must be a real date in the future').first()
        ).toBeVisible();
      });
    });
  });

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/update-frequency`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });
});
