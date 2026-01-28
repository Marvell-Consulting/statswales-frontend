import { test, expect } from '@playwright/test';

// Known test data from localstack seed
const TEST_TOPIC = {
  id: '1',
  slug: 'business-economy-and-labour-market',
  nameEn: 'Business, economy and labour market',
  nameCy: "Busnes, economi a'r farchnad lafur"
};

test.describe('Homepage (Topic List)', () => {
  test('Displays homepage heading', async ({ page }) => {
    await page.goto('/en-GB');
    await expect(page.getByRole('heading', { name: 'Find statistics and data about Wales' })).toBeVisible();
  });

  test('Shows topics section', async ({ page }) => {
    await page.goto('/en-GB');
    await expect(page.getByRole('heading', { name: 'Topics' })).toBeVisible();
  });

  test('Can switch to Welsh', async ({ page }) => {
    await page.goto('/en-GB');
    await page.getByText('Cymraeg').click();
    await expect(page.getByRole('heading', { name: 'Darganfod ystadegau a data am Gymru' })).toBeVisible();
  });

  test('Shows topic links', async ({ page }) => {
    await page.goto('/en-GB');
    // Topics should be displayed as links in a list (use first() to avoid matching footer list)
    const topicList = page.locator('.govuk-list').first();
    await expect(topicList).toBeVisible();
  });
});

test.describe('All Datasets Page', () => {
  test('Displays all datasets heading', async ({ page }) => {
    await page.goto('/en-GB/all');
    await expect(page.getByRole('heading', { name: 'Find statistics and data about Wales' })).toBeVisible();
  });

  test('Shows dataset count', async ({ page }) => {
    await page.goto('/en-GB/all');
    // The page shows "X datasets" text - use exact match to avoid matching phase banner
    await expect(page.getByText('datasets', { exact: true })).toBeVisible();
  });

  test('Can switch to Welsh', async ({ page }) => {
    await page.goto('/en-GB/all');
    await page.getByText('Cymraeg').click();
    await expect(page.getByRole('heading', { name: 'Darganfod ystadegau a data am Gymru' })).toBeVisible();
    // Check datasets count text in Welsh (setiau data = datasets) - use exact match
    await expect(page.getByText('setiau data', { exact: true })).toBeVisible();
  });
});

test.describe('Topic Browsing', () => {
  test('Can navigate to a topic', async ({ page }) => {
    await page.goto('/en-GB');
    // Click on a topic link
    await page.getByRole('link', { name: TEST_TOPIC.nameEn }).click();
    // Should show breadcrumbs (use first() as there may be multiple breadcrumb elements)
    await expect(page.locator('.govuk-breadcrumbs').first()).toBeVisible();
    // Should show topic name as heading
    await expect(page.getByRole('heading', { name: TEST_TOPIC.nameEn })).toBeVisible();
  });

  test('Shows breadcrumb navigation', async ({ page }) => {
    await page.goto(`/en-GB/topic/${TEST_TOPIC.id}/${TEST_TOPIC.slug}`);
    // Breadcrumbs should have Home link
    await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  });

  test('Can switch to Welsh on topic page', async ({ page }) => {
    await page.goto(`/en-GB/topic/${TEST_TOPIC.id}/${TEST_TOPIC.slug}`);
    await page.getByText('Cymraeg').click();
    // URL should change to Welsh
    await expect(page).toHaveURL(/\/cy/);
  });
});
