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
    await expect(page.getByRole('heading', { name: 'Welcome to the StatsWales Beta' })).toBeVisible();
  });

  test('Can switch to Welsh', async ({ page }) => {
    await page.goto('/en-GB');
    await page.getByText('Cymraeg').click();
    await expect(page.getByRole('heading', { name: 'Croeso i Beta StatsCymru' })).toBeVisible();
  });
});
