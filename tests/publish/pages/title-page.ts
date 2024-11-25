import type { Page, Locator } from '@playwright/test';

import { appConfig } from '../../../src/config';
import { DatasetDTO } from '../../../src/dtos/dataset';

const config = appConfig();
const baseUrl = config.frontend.url;

export class TitlePage {
  private readonly inputBox: Locator;

  constructor(public readonly page: Page) {
    this.inputBox = this.page.locator('input#title');
  }

  async goto(datasetId?: string) {
    const url = datasetId ? `${baseUrl}/en-GB/publish/${datasetId}/title` : `${baseUrl}/en-GB/publish/title`;
    await this.page.goto(url);
  }

  async enterTitle(text: string) {
    await this.inputBox.fill(text);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async cancel() {
    await this.page.getByRole('link', { name: 'Cancel' }).click();
  }
}
