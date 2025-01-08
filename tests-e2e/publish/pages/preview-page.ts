import type { Page } from '@playwright/test';

import { appConfig } from '../../../src/config';

const config = appConfig();
const baseUrl = config.frontend.url;

export class PreviewPage {
  constructor(public readonly page: Page) {}

  async goto(datasetId: string) {
    await this.page.goto(`${baseUrl}/en-GB/publish/${datasetId}/preview`);
  }

  async pageSize(pageSize: number) {
    await this.page.locator('select[name="page_size"]').selectOption(pageSize.toString());
    await this.page.locator('button', { hasText: 'Update' }).click();
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: 'Choose a different data table' }).click();
  }
}
