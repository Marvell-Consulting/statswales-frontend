import { test, expect, Page } from '@playwright/test';
import { nanoid } from 'nanoid';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';
import { startNewDataset, selectUserGroup, provideDatasetTitle } from '../helpers/publishing-steps';

const baseUrl = config.frontend.publisher.url;

test.describe.configure({ mode: 'serial' }); // tests in this file must be performed in order to avoid test failures

test.describe('Metadata - Data providers', () => {
  const title = `meta-providers.spec - ${nanoid(5)}`;
  let datasetId: string;

  async function filterProviders(page: Page, provider: string) {
    await page.locator('input#provider_id').fill(provider);
  }

  async function selectProvider(page: Page, provider: string) {
    await page.locator('input#provider_id').fill(provider);
    await page.click(`text=${provider}`);
  }

  async function hasSource(page: Page, hasSource: boolean) {
    if (hasSource) {
      await page.getByText('Select source', { exact: true }).click();
    } else {
      await page.getByText('No specific source from data provider', { exact: true }).click();
    }
  }

  async function filterSources(page: Page, source: string) {
    await page.locator('input#source_id').fill(source);
  }

  async function selectSource(page: Page, source: string) {
    await page.locator('input#source_id').fill(source);
    await page.click(`text=${source}`);
  }

  async function addAnotherProvider(page: Page, addProvider: boolean) {
    if (addProvider) {
      await page.getByText('Yes', { exact: true }).click();
    } else {
      await page.getByText('No', { exact: true }).click();
    }
  }

  async function removeAllProviders(page: Page) {
    while (await page.getByRole('link', { name: 'Remove' }).first().isVisible()) {
      await page.getByRole('link', { name: 'Remove' }).first().click();
    }
  }

  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/providers`);
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
    });

    test('Has a heading', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/providers`);
      await expect(page.getByRole('heading', { name: 'Add a data provider' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/providers`);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Ychwanegu darparwr data' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/providers`);
        await removeAllProviders(page);
      });

      test('Displays a validation error when no provider is selected', async ({ page }) => {
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/providers`);
        await expect(page.getByText('Select a data provider from the list of data providers')).toBeVisible();
      });

      test('Displays an empty provider list if there are no matches', async ({ page }) => {
        await filterProviders(page, 'No matches');
        await expect(page.getByText('No results found')).toBeVisible();
      });

      test('Displays a list of matching providers', async ({ page }) => {
        await filterProviders(page, 'Department');
        await expect(page.getByText('Department for Education').first()).toBeVisible();
        await expect(page.getByText('Department for Environment, Food and Rural Affairs').first()).toBeVisible();
        await expect(page.getByText('Department for Transport').first()).toBeVisible();
        await expect(page.getByText('Department for Work and Pensions (DWP)').first()).toBeVisible();
        await expect(page.getByText('Department of Health & Social Care').first()).toBeVisible();
      });

      test('Can successfully select a provider and proceed to the source select', async ({ page }) => {
        await selectProvider(page, 'Department for Transport');
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(
          page.getByRole('heading', { name: 'Add a data source from the selected data provider' })
        ).toBeVisible();
      });

      test('Displays a validation error when has source option not selected', async ({ page }) => {
        await selectProvider(page, 'Department for Transport');
        await page.getByRole('button', { name: 'Continue' }).click();

        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(
          page.getByText(
            'Select whether to select a source or indicate there is no specific source from the data provider'
          )
        ).toBeVisible();
      });

      test('Displays a validation error when has source selected but no source option selected', async ({ page }) => {
        await selectProvider(page, 'Department for Transport');
        await page.getByRole('button', { name: 'Continue' }).click();

        await hasSource(page, true);
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(
          page.getByText('Select a source from the list of sources for the selected data provider')
        ).toBeVisible();
      });

      test('Displays a list of matching sources', async ({ page }) => {
        await selectProvider(page, 'Department for Transport');
        await page.getByRole('button', { name: 'Continue' }).click();

        await hasSource(page, true);

        await filterSources(page, 'Traffic');
        await expect(page.getByText('Automated traffic counts').first()).toBeVisible();
        await expect(page.getByText('Manual traffic survey').first()).toBeVisible();
      });

      test('Can successfully select a provider with source', async ({ page }) => {
        await selectProvider(page, 'Department for Transport');
        await page.getByRole('button', { name: 'Continue' }).click();

        await hasSource(page, true);
        await selectSource(page, 'Automated traffic counts');
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(page.getByRole('heading', { name: 'Sources added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Department for Transport' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Automated traffic counts' })).toBeVisible();
      });

      test('Displays a validation error if add another source option not selected', async ({ page }) => {
        await selectProvider(page, 'Department for Transport');
        await page.getByRole('button', { name: 'Continue' }).click();

        await hasSource(page, true);
        await selectSource(page, 'Automated traffic counts');
        await page.getByRole('button', { name: 'Continue' }).click();

        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.getByText('Select yes if you need to add another source')).toBeVisible();
      });
    });

    test.describe('Form success', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${baseUrl}/en-GB/publish/${datasetId}/providers`);
      });

      test('Can add single provider with no source', async ({ page }) => {
        await removeAllProviders(page);

        // provider 1
        await selectProvider(page, 'Department for Transport');
        await page.getByRole('button', { name: 'Continue' }).click();

        await hasSource(page, false);
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(page.getByRole('heading', { name: 'Sources added' })).toBeVisible();

        await addAnotherProvider(page, false);
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
      });

      test('Can add multiple providers', async ({ page }) => {
        await removeAllProviders(page);

        // provider 1
        await selectProvider(page, 'Department for Transport');
        await page.getByRole('button', { name: 'Continue' }).click();

        await hasSource(page, false);
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(page.getByRole('heading', { name: 'Sources added' })).toBeVisible();
        await addAnotherProvider(page, true);
        await page.getByRole('button', { name: 'Continue' }).click();

        // provider 2
        await selectProvider(page, 'Department for Education');
        await page.getByRole('button', { name: 'Continue' }).click();
        await hasSource(page, true);
        await selectSource(page, 'Employer skills survey');
        await page.getByRole('button', { name: 'Continue' }).click();

        await addAnotherProvider(page, true);
        await page.getByRole('button', { name: 'Continue' }).click();

        // provider 3
        await selectProvider(page, 'Sport Wales');
        await page.getByRole('button', { name: 'Continue' }).click();

        await hasSource(page, true);
        await selectSource(page, 'Geographical information');
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(page.getByRole('heading', { name: 'Sources added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Department for Transport' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'No specific source from data provider' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Department for Education' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Employer skills survey' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Sport Wales' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Geographical information' })).toBeVisible();

        await addAnotherProvider(page, false);
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetId}/tasklist`);
      });

      test('Can remove a single provider', async ({ page }) => {
        const row = await page.getByRole('row', { name: 'Employer skills survey' });
        await row.getByRole('link', { name: 'Remove' }).click();

        await expect(page.getByRole('heading', { name: 'Sources added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Department for Transport' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'No specific source from data provider' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Department for Education' })).not.toBeVisible();
        await expect(page.getByRole('cell', { name: 'Employer skills survey' })).not.toBeVisible();
        await expect(page.getByRole('cell', { name: 'Sport Wales' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Geographical information' })).toBeVisible();
      });
    });
  });
});
