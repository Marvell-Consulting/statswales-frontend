import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/shared/config';

import { QualityPage } from './pages/quality-page';
import { users } from '../fixtures/logins';
import { createEmptyDataset } from './helpers/create-empty-dataset';

const config = appConfig();
const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Quality', () => {
  let qualityPage: QualityPage;
  let id: string;

  test.beforeEach(async ({ page }) => {
    qualityPage = new QualityPage(page);
  });

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await qualityPage.goto(id);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      id = await createEmptyDataset(page, 'Meta quality spec');
    });

    test('Has a heading', async ({ page }) => {
      await qualityPage.goto(id);
      await expect(
        page.getByRole('heading', { name: 'What is the statistical quality of this dataset?' })
      ).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await qualityPage.goto(id);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Beth yw ansawdd ystadegol y set ddata hon?' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async () => {
        // Only use metadata A dataset for failed form validation - once successfully saved, tests for a missing
        // rounding_applied radio selection will fail as it is pre-populated with the value from the previous form
        await qualityPage.goto(id);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await qualityPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/quality`);
        await expect(page.getByText('Enter the statistical quality of this dataset').first()).toBeVisible();
        await expect(
          page.getByText('Select whether any rounding has been applied to the data values').first()
        ).toBeVisible();
      });

      test('Displays a validation error when the quality input is only whitespace', async ({ page }) => {
        await qualityPage.fillForm('   ', true, 'This is a description of rounding applied.');
        await qualityPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/quality`);
        await expect(page.getByText('Enter the statistical quality of this dataset').first()).toBeVisible();
      });

      test('Displays a validation error when rounding applied is not specified', async ({ page }) => {
        await qualityPage.fillForm('This is info about data quality.', undefined, undefined);
        await qualityPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/quality`);
        await expect(
          page.getByText('Select whether any rounding has been applied to the data values').first()
        ).toBeVisible();
      });

      test('Displays a validation error when rounding applied but rounding description missing', async ({ page }) => {
        await qualityPage.fillForm('This is info about data quality.', true, '');
        await qualityPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/quality`);
        await expect(page.getByText('Enter what rounding has been applied to the data values').first()).toBeVisible();
      });
    });

    test.describe('Form success', () => {
      let id: string;

      test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        id = await createEmptyDataset(page, 'Meta quality spec');
      });

      test.beforeEach(async () => {
        await qualityPage.goto(id);
      });

      test('Can add info about quality with no rounding applied then return to the tasklist', async ({ page }) => {
        await qualityPage.fillForm('This is info about data quality.', false);
        await qualityPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/tasklist`);
      });

      test('Can add info about quality and rounding then return to the tasklist', async ({ page }) => {
        await qualityPage.fillForm('This is info about data quality.', true, 'This is how rounding applied.');
        await qualityPage.submit();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${id}/tasklist`);
      });
    });
  });
});
