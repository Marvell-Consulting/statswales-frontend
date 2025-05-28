import { test, expect } from '@playwright/test';

import { appConfig } from '../../src/config';
import { users } from '../fixtures/logins';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Not authed', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test('Redirects to login page when not authenticated', async ({ page }) => {
    await page.goto('/en-GB/publish');
    expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
  });
});

test.describe('Authed as a publisher', () => {
  test.use({ storageState: users.publisher.path });

  test('Has a heading', async ({ page }) => {
    await page.goto('/en-GB/publish');
    await expect(page.getByRole('heading', { name: 'Create a new dataset' })).toBeVisible();
  });

  test('Can switch to Welsh', async ({ page }) => {
    await page.goto('/en-GB/publish');
    await page.getByText('Cymraeg').click();
    await expect(page.getByRole('heading', { name: 'Creu set ddata newydd' })).toBeVisible();
  });

  test('Starts the publish journey', async ({ page }) => {
    await page.goto('/en-GB/publish');
    await page.getByRole('link', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/title`);
  });
});
