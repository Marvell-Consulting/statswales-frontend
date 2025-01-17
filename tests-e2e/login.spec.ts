import { test, expect } from '@playwright/test';

test('Has a heading', async ({ page }) => {
  await page.goto('/en-GB/auth/login');
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

test('Can switch to Welsh', async ({ page }) => {
  await page.goto('/en-GB/auth/login');
  await page.getByText('Cymraeg').click();
  await expect(page.getByRole('heading', { name: 'Mewngofnodi' })).toBeVisible();
});

test('Provides Google auth', async ({ page }) => {
  await page.goto('/en-GB/auth/login');
  await expect(page.getByRole('link', { name: 'Google' })).toBeVisible();
});

test('Provides Microsoft (EntraID) auth', async ({ page }) => {
  await page.goto('/en-GB/auth/login');
  await expect(page.getByRole('link', { name: 'Microsoft' })).toBeVisible();
});
