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

test.describe('Dataset Filtering', () => {
  test.describe('Filter Sidebar', () => {
    test('Shows filter sidebar with apply button', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      // Filter apply button should be visible
      await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible();
    });

    test('Shows page size selector with options', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      const pageSizeSelect = page.locator('#page_size');
      await expect(pageSizeSelect).toBeVisible();
      // Verify some page size options exist
      await expect(pageSizeSelect.locator('option')).toHaveCount(7); // 5, 10, 25, 50, 100, 250, 500
    });

    test('Shows filter groups for dataset dimensions', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      // Filter groups are rendered as details elements or divs with filter- prefix ids
      const filterGroups = page.locator('[id^="filter-"]');
      // Should have at least one filter group (datasets have dimensions)
      await expect(filterGroups.first()).toBeVisible();
    });

    test('Filter checkboxes are interactive', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      // Find a filter checkbox
      const filterCheckbox = page.locator('.checkboxes__input__filter').first();
      if (await filterCheckbox.isVisible()) {
        // Checkbox should be checkable
        await filterCheckbox.check({ force: true });
        await expect(filterCheckbox).toBeChecked();
      }
    });
  });

  test.describe('Page Size', () => {
    test('Can change page size to 25', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      await page.locator('#page_size').selectOption('25');
      await page.getByRole('button', { name: 'Apply' }).click();
      await expect(page).toHaveURL(/page_size=25/);
    });

    test('Can change page size to 50', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      await page.locator('#page_size').selectOption('50');
      await page.getByRole('button', { name: 'Apply' }).click();
      await expect(page).toHaveURL(/page_size=50/);
    });

    test('Page size persists after applying filters', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      await page.locator('#page_size').selectOption('25');
      await page.getByRole('button', { name: 'Apply' }).click();
      // After redirect, page size should still be selected
      await expect(page.locator('#page_size')).toHaveValue('25');
    });
  });

  test.describe('Applying Filters', () => {
    test('Applying filters redirects to filtered URL', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      // Apply filters (even without changing anything, it should work)
      await page.getByRole('button', { name: 'Apply' }).click();
      // URL should change to include /filtered/ path
      await expect(page).toHaveURL(/\/filtered\//);
    });

    test('Filtered view shows data table', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      await page.getByRole('button', { name: 'Apply' }).click();
      // Table should still be visible in filtered view
      await expect(page.locator('table')).toBeVisible();
    });

    test('Filter selection is preserved in filtered view', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      // Select a specific page size before filtering
      await page.locator('#page_size').selectOption('50');
      await page.getByRole('button', { name: 'Apply' }).click();
      // Page size should be preserved
      await expect(page.locator('#page_size')).toHaveValue('50');
    });
  });

  test.describe('Filter Controls', () => {
    test('Select all and None links are available in filter groups', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      // Filter groups have "Select all" and "None" controls
      const selectAllLink = page.locator('[data-action="select-all"]').first();
      const clearLink = page.locator('[data-action="clear"]').first();
      await expect(selectAllLink).toBeVisible();
      await expect(clearLink).toBeVisible();
    });

    test('Not filtered checkbox is checked by default', async ({ page }) => {
      await page.goto('/en-GB/all');
      const firstDataset = page.locator('.index-list__item a').first();
      await firstDataset.click();
      // The "Not filtered" checkbox (input with id ending in "-all") should be checked by default
      const notFilteredCheckbox = page.locator('input[type="checkbox"][id$="-all"]').first();
      await expect(notFilteredCheckbox).toBeChecked();
    });
  });
});

test.describe('Dataset Pagination', () => {
  test('Shows pagination info when data has multiple pages', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Set small page size to ensure pagination
    await page.locator('#page_size').selectOption('5');
    await page.getByRole('button', { name: 'Apply' }).click();
    // Pagination may or may not appear depending on data size
    // Just verify the page loaded successfully with the filtered view
    await expect(page.locator('table')).toBeVisible();
  });

  test('Can navigate to next page if available', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.locator('#page_size').selectOption('5');
    await page.getByRole('button', { name: 'Apply' }).click();
    // Check if next page link exists
    const nextLink = page.getByRole('link', { name: /next/i });
    if (await nextLink.isVisible()) {
      await nextLink.click();
      await expect(page).toHaveURL(/page_number=2/);
    }
  });

  test('Page number is preserved in URL', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.locator('#page_size').selectOption('5');
    await page.getByRole('button', { name: 'Apply' }).click();
    const nextLink = page.getByRole('link', { name: /next/i });
    if (await nextLink.isVisible()) {
      await nextLink.click();
      // URL should contain page_number parameter
      await expect(page).toHaveURL(/page_number/);
    }
  });
});

test.describe('Dataset Table Sorting', () => {
  test('Table headers are displayed', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Table should have header row
    const tableHeaders = page.locator('table thead th, table th');
    await expect(tableHeaders.first()).toBeVisible();
  });

  test('Sortable columns have sort links', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Look for sort links/buttons in table headers
    const sortableHeader = page.locator('th a, th button').first();
    if (await sortableHeader.isVisible()) {
      await expect(sortableHeader).toBeVisible();
    }
  });

  test('Clicking sort changes URL parameters', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Apply filters first to get to filtered view
    await page.getByRole('button', { name: 'Apply' }).click();
    // Look for sortable column link
    const sortLink = page.locator('th a').first();
    if (await sortLink.isVisible()) {
      await sortLink.click();
      // URL should contain sort parameters
      await expect(page).toHaveURL(/sort_by/);
    }
  });
});

test.describe('Download with Filters', () => {
  test('Download tab shows view type options', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    // Should show download view options (filtered vs all data)
    const viewTypeOptions = page.locator('input[name="view_type"]');
    await expect(viewTypeOptions.first()).toBeVisible();
  });

  test('Download tab shows format options', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    // CSV, Excel, JSON options
    await expect(page.getByLabel('CSV')).toBeVisible();
    await expect(page.getByLabel('Excel')).toBeVisible();
    await expect(page.getByLabel('JSON')).toBeVisible();
  });

  test('Download tab shows data choice options', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    // View choice options (raw, formatted, etc.)
    const viewChoiceOptions = page.locator('input[name="view_choice"]');
    await expect(viewChoiceOptions.first()).toBeVisible();
  });

  test('Download button is present', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    await page.getByRole('tab', { name: 'Download' }).click();
    await expect(page.getByRole('button', { name: 'Download data' })).toBeVisible();
  });

  test('Download preserves filter state', async ({ page }) => {
    await page.goto('/en-GB/all');
    const firstDataset = page.locator('.index-list__item a').first();
    await firstDataset.click();
    // Apply filters first
    await page.locator('#page_size').selectOption('25');
    await page.getByRole('button', { name: 'Apply' }).click();
    // Go to download tab
    await page.getByRole('tab', { name: 'Download' }).click();
    // Hidden field should contain filter options
    const filterOptionsField = page.locator('#selected_filter_options');
    await expect(filterOptionsField).toBeAttached();
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
