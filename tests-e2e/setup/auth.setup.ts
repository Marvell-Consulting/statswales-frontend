import { test as setup, expect, Page, TestInfo } from '@playwright/test';
import { users } from '../fixtures/logins';

async function login(page: Page, user: { username: string; path: string }, testInfo: TestInfo) {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('/en-GB/auth/login');
  await page.getByRole('link', { name: 'Form' }).click();
  await page.getByLabel('Username').fill(user.username);
  await page.getByRole('button', { name: 'Continue' }).click();

  const screenshotPath = testInfo.outputPath(`${user.username}.png`);
  testInfo.attachments.push({ name: 'screenshot', path: screenshotPath, contentType: 'image/png' });
  // Take the screenshot itself.
  await page.screenshot({ path: screenshotPath, timeout: 5000 });

  await expect(page.getByRole('heading', { name: 'Datasets' })).toBeVisible();

  await page.context().storageState({ path: user.path });
}

setup('authenticate as admin', async ({ page }, testInfo) => {
  await login(page, users.admin, testInfo);
});

setup('authenticate as publisher', async ({ page }, testInfo) => {
  await login(page, users.publisher, testInfo);
});

setup('authenticate as approver', async ({ page }, testInfo) => {
  await login(page, users.approver, testInfo);
});
