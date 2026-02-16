import { test as setup } from '@playwright/test';

import { solos } from '../fixtures/logins';
import { CONSUMER_DATASET_TITLE } from '../fixtures/dataset-title';
import { publishRealisticDataset } from '../publish/helpers/publishing-steps';

// Consumer setup always uses the first solo user (not parallelised)
setup.use({ storageState: solos[0].path });

setup('publish realistic dataset for consumer tests', async ({ page }, testInfo) => {
  setup.setTimeout(120_000);
  await publishRealisticDataset(page, testInfo, CONSUMER_DATASET_TITLE);
});
