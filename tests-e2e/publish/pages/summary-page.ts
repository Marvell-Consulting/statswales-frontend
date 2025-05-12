import type { Page, Locator } from '@playwright/test';

import { appConfig } from '../../../src/config';

const config = appConfig();
const baseUrl = config.frontend.url;

export class SummaryPage {
  private readonly inputBox: Locator;

  constructor(public readonly page: Page) {
    this.inputBox = this.page.locator('textarea#summary');
  }

  async goto(datasetId: string) {
    await this.page.goto(`${baseUrl}/en-GB/publish/${datasetId}/summary`);
  }

  async fillForm(text: string) {
    await this.inputBox.fill(text);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
