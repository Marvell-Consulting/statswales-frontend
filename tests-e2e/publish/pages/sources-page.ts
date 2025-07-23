import type { Page } from '@playwright/test';

import { appConfig } from '../../../src/shared/config';

const config = appConfig();
const baseUrl = config.frontend.publisher.url;

export class SourcesPage {
  constructor(public readonly page: Page) {}

  async goto(datasetId: string) {
    await this.page.goto(`${baseUrl}/en-GB/publish/${datasetId}/sources`);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
