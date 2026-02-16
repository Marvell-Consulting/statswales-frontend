import { test as setup } from '@playwright/test';

import { users } from '../fixtures/logins';
import { CONSUMER_DATASET_TITLE } from '../fixtures/dataset-title';
import { publishRealisticDataset } from '../publish/helpers/publishing-steps';

setup.use({ storageState: users.solo.path });

setup('publish realistic dataset for consumer tests', async ({ page }, testInfo) => {
  setup.setTimeout(120_000);
  await publishRealisticDataset(page, testInfo, CONSUMER_DATASET_TITLE);
});
