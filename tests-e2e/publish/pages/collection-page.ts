import type { Page, Locator } from '@playwright/test';

import { config } from '../../../src/shared/config';

const baseUrl = config.frontend.publisher.url;

export class CollectionPage {
  private readonly inputBox: Locator;

  constructor(public readonly page: Page) {
    this.inputBox = this.page.locator('textarea#collection');
  }

  async goto(datasetId: string) {
    await this.page.goto(`${baseUrl}/en-GB/publish/${datasetId}/collection`);
  }

  async fillForm(text: string) {
    await this.inputBox.fill(text);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
