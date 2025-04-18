import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';
import { metadataA as dataset, metadataB as datasetB } from '../fixtures/datasets';

import { ProviderPage } from './pages/provider-page';
import { users } from '../fixtures/logins';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe.configure({ mode: 'serial' }); // tests in this file must be performed in order to avoid test failures

test.describe('Metadata Data Providers', () => {
  let providerPage: ProviderPage;

  test.beforeEach(async ({ page }) => {
    providerPage = new ProviderPage(page);
  });

  test.describe('Not authed', () => {
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await providerPage.goto(dataset.id);
      await expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test('Has a heading', async ({ page }) => {
      await providerPage.goto(dataset.id);
      await expect(page.getByRole('heading', { name: 'Add a data provider' })).toBeVisible();
    });

    test.fixme('Can switch to Welsh', async ({ page }) => {
      // TODO: waiting on translations
      await providerPage.goto(dataset.id);
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: '' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test.beforeEach(async ({ page }) => {
        await providerPage.goto(dataset.id);

        // clean up any existing providers before each test
        while (await page.getByRole('link', { name: 'Remove' }).first().isVisible()) {
          await page.getByRole('link', { name: 'Remove' }).first().click();
        }
      });

      test('Displays a validation error when no provider is selected', async ({ page }) => {
        await providerPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${dataset.id}/providers`);
        await expect(page.getByText('Select a data provider from the list of data providers')).toBeVisible();
      });

      test('Displays an empty provider list if there are no matches', async ({ page }) => {
        await providerPage.filterProviders('No matches');
        await expect(page.getByText('No results found')).toBeVisible();
      });

      test('Displays a list of matching providers', async ({ page }) => {
        await providerPage.filterProviders('Department');
        await expect(page.getByText('Department for Education').first()).toBeVisible();
        await expect(page.getByText('Department for Environment, Food and Rural Affairs').first()).toBeVisible();
        await expect(page.getByText('Department for Transport').first()).toBeVisible();
        await expect(page.getByText('Department for Work and Pensions (DWP)').first()).toBeVisible();
        await expect(page.getByText('Department of Health & Social Care').first()).toBeVisible();
      });

      test('Can successfully select a provider and proceed to the source select', async ({ page }) => {
        await providerPage.selectProvider('Department for Transport');
        await providerPage.submit();
        await expect(
          page.getByRole('heading', { name: 'Add a data source from the selected data provider' })
        ).toBeVisible();
      });

      test('Displays a validation error when has source option not selected', async ({ page }) => {
        await providerPage.selectProvider('Department for Transport');
        await providerPage.submit();

        await providerPage.submit();
        await expect(
          page.getByText(
            'Select whether to select a source or indicate there is no specific source from the data provider'
          )
        ).toBeVisible();
      });

      test('Displays a validation error when has source selected but no source option selected', async ({ page }) => {
        await providerPage.selectProvider('Department for Transport');
        await providerPage.submit();

        await providerPage.hasSource(true);
        await providerPage.submit();

        await expect(
          page.getByText('Select a source from the list of sources for the selected data provider')
        ).toBeVisible();
      });

      test('Displays a list of matching sources', async ({ page }) => {
        await providerPage.selectProvider('Department for Transport');
        await providerPage.submit();

        await providerPage.hasSource(true);

        await providerPage.filterSources('Traffic');
        await expect(page.getByText('Automated traffic counts').first()).toBeVisible();
        await expect(page.getByText('Manual traffic survey').first()).toBeVisible();
      });

      test('Can successfully select a provider with source', async ({ page }) => {
        await providerPage.selectProvider('Department for Transport');
        await providerPage.submit();

        await providerPage.hasSource(true);
        await providerPage.selectSource('Automated traffic counts');
        await providerPage.submit();

        await expect(page.getByRole('heading', { name: 'Sources added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Department for Transport' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Automated traffic counts' })).toBeVisible();
      });

      test('Displays a validation error if add another source option not selected', async ({ page }) => {
        await providerPage.selectProvider('Department for Transport');
        await providerPage.submit();

        await providerPage.hasSource(true);
        await providerPage.selectSource('Automated traffic counts');
        await providerPage.submit();

        await providerPage.submit();
        await expect(page.getByText('Select yes if you need to add another source')).toBeVisible();
      });
    });

    test.describe('Form success', () => {
      test.beforeEach(async () => {
        await providerPage.goto(datasetB.id);
      });

      test('Can add single provider with no source', async ({ page }) => {
        while (await page.getByRole('link', { name: 'Remove' }).first().isVisible()) {
          await page.getByRole('link', { name: 'Remove' }).first().click();
        }

        // provider 1
        await providerPage.selectProvider('Department for Transport');
        await providerPage.submit();

        await providerPage.hasSource(false);
        await providerPage.submit();

        await expect(page.getByRole('heading', { name: 'Sources added' })).toBeVisible();

        await providerPage.addAnotherProvider(false);
        await providerPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetB.id}/tasklist`);
      });

      test('Can add multiple providers', async ({ page }) => {
        await providerPage.addAnotherProvider(true);
        await providerPage.submit();

        // provider 2
        await providerPage.selectProvider('Department for Education');
        await providerPage.submit();
        await providerPage.hasSource(true);
        await providerPage.selectSource('Employer skills survey');
        await providerPage.submit();

        await providerPage.addAnotherProvider(true);
        await providerPage.submit();

        // provider 3
        await providerPage.selectProvider('Sport Wales');
        await providerPage.submit();

        await providerPage.hasSource(true);
        await providerPage.selectSource('Geographical information');
        await providerPage.submit();

        await expect(page.getByRole('heading', { name: 'Sources added' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Department for Transport' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'No specific source from data provider' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Department for Education' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Employer skills survey' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Sport Wales' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Geographical information' })).toBeVisible();

        await providerPage.addAnotherProvider(false);
        await providerPage.submit();
        await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/${datasetB.id}/tasklist`);
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
