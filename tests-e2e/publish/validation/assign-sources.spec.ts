import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';
import { startNewDataset, selectUserGroup, provideDatasetTitle, uploadDataTable } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe('Sources page', () => {
  const title = `assign-sources.spec - ${nanoid(5)}`;
  let datasetId: string;

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await startNewDataset(page);
      await selectUserGroup(page, 'E2E tests');
      datasetId = await provideDatasetTitle(page, title);
      await uploadDataTable(page, datasetId, 'minimal/data.csv');
    });

    test('Has a heading', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await expect(
        page.getByRole('heading', { name: 'What does each column in the data table contain?' })
      ).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
      await page.getByText('Cymraeg').click();
      await expect(
        page.getByRole('heading', { name: 'Beth mae pob colofn yn y tabl data yn ei gynnwys?' })
      ).toBeVisible();
    });

    test.fixme('Displays an error if no sources are selected', async () => {});
    test.fixme('Displays an error if not all sources are selected', async () => {});
    test.fixme('Displays an error if more than one value source is selected', async () => {});
    test.fixme('Displays an error if more than one notes source is selected', async () => {});
    test.fixme('Displays an error if more than one measure source is selected', async () => {});
  });
});
