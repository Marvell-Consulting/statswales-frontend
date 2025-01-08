import type { Page, Locator } from '@playwright/test';

import { appConfig } from '../../../src/config';

const config = appConfig();
const baseUrl = config.frontend.url;

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

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
