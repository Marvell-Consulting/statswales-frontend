import { test, expect } from '@playwright/test';

import { publisherContext } from '../../playwright/.auth/contexts';
import { appConfig } from '../../src/config';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Not authed', () => {
  test('Redirects to login page when not authenticated', async ({ page }) => {
    await page.goto('/en-GB/publish');
    await expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
  });
});

test.describe('Authed as a publisher', () => {
  test.use({ storageState: publisherContext });

  test('Has a heading', async ({ page }) => {
    await page.goto('/en-GB/publish');
    await expect(page.getByRole('heading', { name: 'Create a new dataset' })).toBeVisible();
  });

  test('Can switch to Welsh', async ({ page }) => {
    await page.goto('/en-GB/publish');
    await page.getByText('Cymraeg').click();
    await expect(page.getByRole('heading', { name: 'Creu set ddata newydd' })).toBeVisible();
  });

  test('Can be cancelled', async ({ page }) => {
    await page.goto('/en-GB/publish');
    await page.getByRole('link', { name: 'Cancel' }).click();
    expect(page.url()).toBe(`${baseUrl}/en-GB`);
  });

  test('Starts the publish journey', async ({ page }) => {
    await page.goto('/en-GB/publish');
    await page.getByRole('link', { name: 'Continue' }).click();
    await expect(page.url()).toBe(`${baseUrl}/en-GB/publish/title`);
  });
});
