import { test, expect } from '@playwright/test';

import { publisherContext } from '../playwright/.auth/contexts';

test.describe('Not authed', () => {
  test('Redirects to login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    expect(page.url()).toBe('http://localhost:3000/en-GB/auth/login');
  });
});

test.describe('Authed as a publisher', () => {
  test.use({ storageState: publisherContext });

  test('Has a heading', async ({ page }) => {
    await page.goto('/en-GB');
    await expect(page.getByRole('heading', { name: 'StatsWales datasets' })).toBeVisible();
  });

  test.fixme('Can switch to Welsh', async ({ page }) => {
    // TODO: waiting on translations
    await page.goto('/en-GB');
    await page.getByText('Cymraeg').click();
    await expect(page.getByRole('heading', { name: '' })).toBeVisible();
  });

  test('Displays a table listing datasets', async ({ page }) => {
    await page.goto('/en-GB');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last updated' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Dataset status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Publishing status' })).toBeVisible();

    const uploadTestDataset = await page.getByRole('row', { name: 'Test - Upload' });
    await expect(uploadTestDataset.getByRole('link', { name: 'Test - Upload' })).toBeVisible();
    await expect(uploadTestDataset.getByRole('cell', { name: 'New' })).toBeVisible();
    await expect(uploadTestDataset.getByRole('cell', { name: 'Incomplete' })).toBeVisible();
  });
});
