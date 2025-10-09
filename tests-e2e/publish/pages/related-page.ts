import type { Page, Locator } from '@playwright/test';

import { config } from '../../../src/shared/config';

const baseUrl = config.frontend.publisher.url;

export class RelatedLinksPage {
  private readonly urlInput: Locator;
  private readonly labelInput: Locator;

  constructor(public readonly page: Page) {
    this.urlInput = this.page.locator('input#link_url');
    this.labelInput = this.page.locator('input#link_label');
  }

  async goto(datasetId: string) {
    await this.page.goto(`${baseUrl}/en-GB/publish/${datasetId}/related`);
  }

  async fillForm(url?: string, label?: string) {
    if (url) {
      await this.urlInput.fill(url);
    }

    if (label) {
      await this.labelInput.fill(label);
    }
  }

  async addAnotherLink(addLink: boolean) {
    if (addLink) {
      await this.page.getByText('Yes', { exact: true }).click();
    } else {
      await this.page.getByText('No', { exact: true }).click();
    }
  }

  async removeAllLinks() {
    while (await this.page.getByRole('link', { name: 'Remove' }).first().isVisible()) {
      await this.page.getByRole('link', { name: 'Remove' }).first().click();
    }
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
