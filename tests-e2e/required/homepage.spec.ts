import { test, expect } from '@playwright/test';

import { users } from '../fixtures/logins';
import { appConfig } from '../../src/shared/config';

const config = appConfig();
const baseUrl = config.frontend.publisher.url;

test.describe('Not authed', () => {
  test('Redirects to login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
  });
});

test.describe('Authed as a publisher', () => {
  test.use({ storageState: users.publisher.path });

  test('Has a heading', async ({ page }) => {
    await page.goto('/en-GB');
    await expect(page.getByRole('heading', { name: 'Datasets' })).toBeVisible();
  });

  test('Can switch to Welsh', async ({ page }) => {
    await page.goto('/en-GB');
    await page.getByText('Cymraeg').click();
    await expect(page.getByRole('heading', { name: 'Setiau data' })).toBeVisible();
  });

  test('Displays a table listing datasets', async ({ page }) => {
    await page.goto('/en-GB');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last updated' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Dataset status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Publishing status' })).toBeVisible();

    const uploadTestDataset = page.getByRole('row', { name: 'Test - Metadata B' });
    await expect(uploadTestDataset.getByRole('link', { name: 'Test - Metadata B' })).toBeVisible();
    await expect(uploadTestDataset.getByRole('cell', { name: 'New' })).toBeVisible();
    await expect(uploadTestDataset.getByRole('cell', { name: 'Incomplete' })).toBeVisible();
  });
});
