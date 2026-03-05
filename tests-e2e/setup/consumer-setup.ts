import { test as setup, BrowserContext } from '@playwright/test';

import { solos } from '../fixtures/logins';
import { acquireUser, releaseUser } from '../fixtures/user-pool';
import { CONSUMER_DATASET_TITLE, CUSTOM_YEAR_DATASET_TITLE } from '../fixtures/dataset-title';
import { publishRealisticDataset, publishCustomYearDataset } from '../publish/helpers/publishing-steps';

setup('publish datasets for consumer tests', async ({ browser }, testInfo) => {
  setup.setTimeout(240_000);

  const solo1 = acquireUser(solos);
  const solo2 = acquireUser(solos);

  let context1: BrowserContext | undefined;
  let context2: BrowserContext | undefined;

  try {
    [context1, context2] = await Promise.all([
      browser.newContext({ storageState: solo1.path }),
      browser.newContext({ storageState: solo2.path })
    ]);

    const [page1, page2] = await Promise.all([context1.newPage(), context2.newPage()]);

    await Promise.all([
      publishRealisticDataset(page1, testInfo, CONSUMER_DATASET_TITLE),
      publishCustomYearDataset(page2, testInfo, CUSTOM_YEAR_DATASET_TITLE)
    ]);
  } finally {
    const closePromises: Promise<void>[] = [];

    if (context1) {
      closePromises.push(context1.close());
    }

    if (context2) {
      closePromises.push(context2.close());
    }

    if (closePromises.length > 0) {
      await Promise.all(closePromises);
    }

    releaseUser(solo1);
    releaseUser(solo2);
  }
});
