import { test, expect } from '@playwright/test';

import { config } from '../../../src/shared/config';
import { users } from '../../fixtures/logins';

const baseUrl = config.frontend.publisher.url;

test.describe('Title page', () => {
  test.describe('Not authed', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test('Redirects to login page when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/title`);
      expect(page.url()).toBe(`${baseUrl}/en-GB/auth/login`);
    });
  });

  test.describe('Authed as a publisher', () => {
    test.use({ storageState: users.publisher.path });

    test.beforeEach(async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish`);
      await page.getByRole('link', { name: 'Continue' }).click();
      await page.getByText('E2E tests', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
    });

    test('Has a heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'What is the title of this dataset?' })).toBeVisible();
    });

    test('Can switch to Welsh', async ({ page }) => {
      await page.getByText('Cymraeg').click();
      await expect(page.getByRole('heading', { name: 'Beth yw teitl y set ddata hon?' })).toBeVisible();
    });

    test.describe('Form validation', () => {
      test('Displays a validation error when no title is provided', async ({ page }) => {
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toContain(`${baseUrl}/en-GB/publish/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });

      test('Displays a validation error when the title is just whitespace', async ({ page }) => {
        await page.getByRole('textbox').fill('   ');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toContain(`${baseUrl}/en-GB/publish/title`);
        await expect(page.getByText('Enter the title of this dataset')).toBeVisible();
      });
    });
  });
});
