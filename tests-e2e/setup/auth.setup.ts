import { test as setup, expect, Page } from '@playwright/test';
import { users } from '../fixtures/logins';

async function login(page: Page, user: { username: string; path: string }) {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('/en-GB/auth/login');
  await page.getByRole('link', { name: 'Form' }).click();
  await page.getByLabel('Username').fill(user.username);
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Datasets' })).toBeVisible();

  await page.context().storageState({ path: user.path });
}

setup('authenticate as admin', async ({ page }) => {
  await login(page, users.admin);
});

setup('authenticate as publisher', async ({ page }) => {
  await login(page, users.publisher);
});

setup('authenticate as approver', async ({ page }) => {
  await login(page, users.approver);
});
