import { test, expect } from '../../fixtures/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata Summary', () => {
  const title = `meta-summary.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('Authed as a publisher', () => {
    test.use({ role: 'publisher' });

    test.beforeAll(async ({ browser, workerUsers }) => {
      const context = await browser.newContext({ storageState: workerUsers.publisher.path });
      const page = await context.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
    });

    test('Has a heading', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
      await expect(
        page.getByRole('heading', { name: 'What is the summary of this dataset and its variables?' })
      ).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
      await page.getByText('Cymraeg').click();
      await expect(
        page.getByRole('heading', { name: `Beth yw’r crynodeb o’r set ddata hon a’i newidynnau?` })
      ).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
      });

      test('Displays a validation error when no input is provided', async ({ page }) => {
        await page.getByRole('textbox').fill('');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
        await expect(page.getByText('Enter the summary of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the input is only whitespace', async ({ page }) => {
        await page.getByRole('textbox').fill('   ');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
        await expect(page.getByText('Enter the summary of this dataset')).toBeVisible();
      });
    });
  });

  test.describe('Not authed', () => {
    // role defaults to null → unauthenticated (no cookies)
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });
});
