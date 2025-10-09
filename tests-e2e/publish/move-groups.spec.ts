import { test, expect } from '@playwright/test';

import { config } from '../../src/shared/config';
import { users } from '../fixtures/logins';

const baseUrl = config.frontend.publisher.url;

test.describe('Move dataset between groups', () => {
  const id = '7f247810-08c3-4cb2-acca-b2c77dc03770';

  test.describe('As editor', () => {
    test.use({ storageState: users.publisher.path });

    test('Is not allowed to move a dataset between groups', async ({ page }) => {
      await page.goto(`/en-GB/publish/${id}/overview`);
      await expect(page.getByRole('link', { name: 'Move dataset between groups' })).not.toBeVisible();

      await page.goto(`/en-GB/publish/${id}/move`);
      await expect(page.getByRole('heading', { name: 'You do not have permission to access this page' })).toBeVisible();
    });
  });

  test.describe('As approver', () => {
    test.use({ storageState: users.approver.path });

    test('Is allowed to move a dataset between groups', async ({ page }) => {
      await page.goto(`/en-GB/publish/${id}/overview`);
      await page.getByRole('link', { name: 'Move dataset to another group' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/move`);

      await page.getByText('E2E tests 2', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(page.getByText('Dataset moved to E2E tests 2')).toBeVisible();
    });
  });
});
