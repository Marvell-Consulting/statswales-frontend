import { test as setup, expect, Page } from '@playwright/test';
import { allUsers } from '../fixtures/logins';

export async function login(page: Page, user: { username: string; path: string }) {
  await page.goto('/en-GB/auth/login');
  await page.getByRole('link', { name: 'Form' }).click();
  await page.getByLabel('Username').fill(user.username);
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Datasets' })).toBeVisible();
  await page.getByRole('button', { name: 'Accept all cookies' }).click();
  await page.context().storageState({ path: user.path });
}

for (const user of allUsers) {
  setup(`authenticate as ${user.username}`, async ({ page }) => {
    await login(page, user);
  });
}
