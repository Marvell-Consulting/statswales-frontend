import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';
import { metadataA as dataset, metadataB as datasetB } from '../fixtures/datasets';

import { QualityPage } from './pages/quality-page';
import { users } from '../fixtures/logins';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Metadata Quality', () => {
  let qualityPage: QualityPage;

  test.beforeEach(async ({ page }) => {
    qualityPage = new QualityPage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await qualityPage.goto(dataset.id);
      await expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test('Has a heading', async ({ page }) => {
      await qualityPage.goto(dataset.id);
      await expect(
        page.getByRole('heading', { name: 'What is the statistical quality of this dataset?' })
      ).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await qualityPage.goto(dataset.id);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Beth yw ansawdd ystadegol y set ddata hon?' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async () => {
        // Only use metadata A dataset for failed form validation - once successfully saved, tests for a missing
        // rounding_applied radio selection will fail as it is pre-populated with the value from the previous form
        await qualityPage.goto(dataset.id);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await qualityPage.fillForm('');
        await qualityPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/quality`);
        await expect(page.getByText('Enter the statistical quality of this dataset').first()).toBeVisible();
        await expect(
          page.getByText('Select whether any rounding has been applied to the data values').first()
        ).toBeVisible();
      });

      test('Displays a validation error when the quality input is only whitespace', async ({ page }) => {
        await qualityPage.fillForm('   ', true, 'This is a description of rounding applied.');
        await qualityPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/quality`);
        await expect(page.getByText('Enter the statistical quality of this dataset').first()).toBeVisible();
      });

      test('Displays a validation error when rounding applied is not specified', async ({ page }) => {
        await qualityPage.fillForm('This is info about data quality.', undefined, undefined);
        await qualityPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/quality`);
        await expect(
          page.getByText('Select whether any rounding has been applied to the data values').first()
        ).toBeVisible();
      });

      test('Displays a validation error when rounding applied but rounding description missing', async ({ page }) => {
        await qualityPage.fillForm('This is info about data quality.', true, '');
        await qualityPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/quality`);
        await expect(page.getByText('Enter what rounding has been applied to the data values').first()).toBeVisible();
      });
    });

    test.describe('Form success', () => {
      test.beforeEach(async () => {
        // using metadata B dataset for successful form submission
        await qualityPage.goto(datasetB.id);
      });

      test('Can add info about quality with no rounding applied then return to the tasklist', async ({ page }) => {
        await qualityPage.fillForm('This is info about data quality.', false);
        await qualityPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetB.id}/tasklist`);
      });

      test('Can add info about quality and rounding then return to the tasklist', async ({ page }) => {
        await qualityPage.fillForm('This is info about data quality.', true, 'This is how rounding applied.');
        await qualityPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetB.id}/tasklist`);
      });
    });
  });
});
