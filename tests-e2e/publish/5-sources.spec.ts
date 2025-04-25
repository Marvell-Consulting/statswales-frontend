import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';
import { sources as dataset } from '../fixtures/datasets';

import { SourcesPage } from './pages/sources-page';
import { users } from '../fixtures/logins';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Sources page', () => {
  let sourcesPage: SourcesPage;

  test.beforeEach(async ({ page }) => {
    sourcesPage = new SourcesPage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await sourcesPage.goto(dataset.id);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeEach(async () => {
      await sourcesPage.goto(dataset.id);
    });

    test('Has a heading', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'What does each column in the data table contain?' })
      ).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
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
