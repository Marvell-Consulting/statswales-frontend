import { test, expect } from '@playwright/test';

test.describe('Feedback Form', () => {
  test('Displays feedback form heading', async ({ page }) => {
    await page.goto('/en-GB/feedback');
    await expect(page.getByRole('heading', { name: 'Give feedback on StatsWales' })).toBeVisible();
  });

  test('Shows satisfaction rating options', async ({ page }) => {
    await page.goto('/en-GB/feedback');
    await expect(page.getByText('Overall, how did you feel about the service you received today?')).toBeVisible();
    await expect(page.getByLabel('Very satisfied')).toBeVisible();
    await expect(page.getByLabel('Satisfied', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Neutral')).toBeVisible();
    await expect(page.getByLabel('Dissatisfied', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Very dissatisfied')).toBeVisible();
  });

  test('Shows improvement text field', async ({ page }) => {
    await page.goto('/en-GB/feedback');
    await expect(page.getByText('How could we improve StatsWales?')).toBeVisible();
  });

  test('Shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/en-GB/feedback');
    await page.getByRole('button', { name: 'Send feedback' }).click();
    // Should show error summary
    await expect(page.getByText('Select how you feel about the service you received today')).toBeVisible();
    await expect(page.getByText('Tell us how we could improve StatsWales')).toBeVisible();
  });

  test('Can switch to Welsh', async ({ page }) => {
    await page.goto('/en-GB/feedback');
    await page.getByText('Cymraeg').click();
    await expect(page.getByRole('heading', { name: 'Rhoi adborth am StatsCymru' })).toBeVisible();
  });

  test('Successful submission shows confirmation', async ({ page }) => {
    await page.goto('/en-GB/feedback');
    // Select satisfaction (force: true needed as label intercepts the click, exact: true to avoid matching similar labels)
    await page.getByLabel('Satisfied', { exact: true }).click({ force: true });
    // Fill improvement field
    await page.locator('#improve').fill('This is a test feedback from e2e tests');
    // Submit
    await page.getByRole('button', { name: 'Send feedback' }).click();
    // Should show success message
    await expect(page.getByText('Thank you for your feedback')).toBeVisible();
  });
});
