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

test.describe('Dataset View', () => {
  test('Can view a published dataset from all datasets page', async ({ page }) => {
    await page.goto('/en-GB/all');
    // Click the first dataset link
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Should show dataset title as h1
    await expect(page.locator('h1.govuk-heading-xl')).toBeVisible();
  });

  test('Shows tab navigation', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Should have Data, About, and Download tabs
    await expect(page.getByRole('tab', { name: 'Data', exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'About this dataset' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Download' })).toBeVisible();
  });

  test('Data tab shows table with filters', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Data tab should be active by default and show table
    await expect(page.locator('table')).toBeVisible();
    // Should show page size selector
    await expect(page.locator('#page_size')).toBeVisible();
  });

  test('About tab shows dataset information', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Click About tab
    await page.getByRole('tab', { name: 'About this dataset' }).click();
    // Should show main information section
    await expect(page.getByRole('heading', { name: 'Main information' })).toBeVisible();
  });

  test('Can switch to Welsh on dataset view', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByText('Cymraeg').click();
    // URL should change to Welsh
    await expect(page).toHaveURL(/\/cy/);
  });
});

test.describe('Download Panel', () => {
  test('Shows download format options', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Click Download tab
    await page.getByRole('tab', { name: 'Download' }).click();
    // Should show format options
    await expect(page.getByLabel('CSV')).toBeVisible();
    await expect(page.getByLabel('Excel')).toBeVisible();
    await expect(page.getByLabel('JSON')).toBeVisible();
  });

  test('Shows download button', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    await expect(page.getByRole('button', { name: 'Download data' })).toBeVisible();
  });

  test('Shows metadata download option', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    // Should show metadata download section
    await expect(page.getByRole('heading', { name: 'Metadata' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download metadata' })).toBeVisible();
  });

  test('Shows language selection for download', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    // Should show language options
    await expect(page.getByLabel('English')).toBeVisible();
    await expect(page.getByLabel('Welsh')).toBeVisible();
  });
});

test.describe('Search', () => {
  test('Displays search page heading', async ({ page }) => {
    await page.goto('/en-GB/search');
    await expect(page.getByRole('heading', { name: 'Search StatsWales' })).toBeVisible();
  });

  test('Shows search input and button', async ({ page }) => {
    await page.goto('/en-GB/search');
    await expect(page.locator('#search-input')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  });

  test('Shows search mode selector', async ({ page }) => {
    await page.goto('/en-GB/search');
    await expect(page.locator('#search-mode')).toBeVisible();
  });

  test('Can perform a search', async ({ page }) => {
    await page.goto('/en-GB/search');
    await page.locator('#search-input').fill('test');
    await page.getByRole('button', { name: 'Search' }).click();
    // URL should contain search query
    await expect(page).toHaveURL(/keywords=test/);
  });

  test('Can switch to Welsh', async ({ page }) => {
    await page.goto('/en-GB/search');
    await page.getByText('Cymraeg').click();
    await expect(page).toHaveURL(/\/cy/);
  });
});

test.describe('Filtered Dataset View', () => {
  test('Can apply filters to dataset', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Check that filter options are available (button text is just "Apply")
    await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible();
  });

  test('Page size selector works', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Change page size
    await page.locator('#page_size').selectOption('25');
    await page.getByRole('button', { name: 'Apply' }).click();
    // URL should contain page_size parameter
    await expect(page).toHaveURL(/page_size=25/);
  });
});

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
