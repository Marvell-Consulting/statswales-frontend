import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Metadata - Designation', () => {
  const title = `meta-designation.spec - ${nanoid(5)}`;
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
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/designation`);
      await expect(page.getByRole('heading', { name: 'How is this dataset designated?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/designation`);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Sut caiff y set ddata hon ei dynodi?' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test('Displays a validation error when no selection is made', async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/designation`);
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/designation`);
        await expect(page.getByText('Select how this dataset is designated').first()).toBeVisible();
      });
    });
  });

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/designation`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });
});
