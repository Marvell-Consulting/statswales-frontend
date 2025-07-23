import type { Page, Locator } from '@playwright/test';

import { appConfig } from '../../../src/shared/config';

const config = appConfig();
const baseUrl = config.frontend.publisher.url;

export class ProviderPage {
  private readonly providerInput: Locator;
  private readonly sourceInput: Locator;

  constructor(public readonly page: Page) {
    this.providerInput = this.page.locator('input#provider_id');
    this.sourceInput = this.page.locator('input#source_id');
  }

  async goto(datasetId: string) {
    await this.page.goto(`${baseUrl}/en-GB/publish/${datasetId}/providers`);
  }

  async filterProviders(provider: string) {
    await this.providerInput.fill(provider);
  }

  async selectProvider(provider: string) {
    await this.providerInput.fill(provider);
    await this.page.click(`text=${provider}`);
  }

  async hasSource(hasSource: boolean) {
    if (hasSource) {
      await this.page.getByText('Select source', { exact: true }).click();
    } else {
      await this.page.getByText('No specific source from data provider', { exact: true }).click();
    }
  }

  async filterSources(source: string) {
    await this.sourceInput.fill(source);
  }

  async selectSource(source: string) {
    await this.sourceInput.fill(source);
    await this.page.click(`text=${source}`);
  }

  async addAnotherProvider(addProvider: boolean) {
    if (addProvider) {
      await this.page.getByText('Yes', { exact: true }).click();
    } else {
      await this.page.getByText('No', { exact: true }).click();
    }
  }

  async removeAllProviders() {
    while (await this.page.getByRole('link', { name: 'Remove' }).first().isVisible()) {
      await this.page.getByRole('link', { name: 'Remove' }).first().click();
    }
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
