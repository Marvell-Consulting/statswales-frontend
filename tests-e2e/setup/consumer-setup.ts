import { test as setup } from '@playwright/test';

import { solos } from '../fixtures/logins';
import { CONSUMER_DATASET_TITLE, CUSTOM_YEAR_DATASET_TITLE } from '../fixtures/dataset-title';
import { publishRealisticDataset, publishCustomYearDataset } from '../publish/helpers/publishing-steps';

setup('publish datasets for consumer tests', async ({ browser }, testInfo) => {
  setup.setTimeout(240_000);

  // Each dataset needs its own browser context with a dedicated user to avoid session interference
  const [context1, context2] = await Promise.all([
    browser.newContext({ storageState: solos[0].path }),
    browser.newContext({ storageState: solos[1].path })
  ]);

  const [page1, page2] = await Promise.all([context1.newPage(), context2.newPage()]);

  await Promise.all([
    publishRealisticDataset(page1, testInfo, CONSUMER_DATASET_TITLE),
    publishCustomYearDataset(page2, testInfo, CUSTOM_YEAR_DATASET_TITLE)
  ]);

  await Promise.all([context1.close(), context2.close()]);
});
