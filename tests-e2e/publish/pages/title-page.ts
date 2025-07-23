import type { Page, Locator } from '@playwright/test';

import { appConfig } from '../../../src/shared/config';

const config = appConfig();
const baseUrl = config.frontend.publisher.url;

export class TitlePage {
  private readonly inputBox: Locator;

  constructor(public readonly page: Page) {
    this.inputBox = this.page.locator('input#title');
  }

  async goto(datasetId: string) {
    await this.page.goto(`${baseUrl}/en-GB/publish/${datasetId}/title`);
  }

  async fillForm(text: string) {
    await this.inputBox.fill(text);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async cancel() {
    await this.page.getByRole('link', { name: 'Cancel' }).click();
  }
}
