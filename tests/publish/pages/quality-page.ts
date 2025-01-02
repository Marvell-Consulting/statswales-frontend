import type { Page, Locator } from '@playwright/test';

import { appConfig } from '../../../src/config';

const config = appConfig();
const baseUrl = config.frontend.url;

export class QualityPage {
  private readonly inputQuality: Locator;
  private readonly inputRoundingDescription: Locator;

  constructor(public readonly page: Page) {
    this.inputQuality = this.page.locator('textarea#quality');
    this.inputRoundingDescription = this.page.locator('textarea#roundingDescription');
  }

  async goto(datasetId: string) {
    await this.page.goto(`${baseUrl}/en-GB/publish/${datasetId}/quality`);
  }

  async fillForm(quality: string, roundingApplied?: boolean, roundingDescription?: string) {
    await this.inputQuality.fill(quality);

    if (roundingApplied === true) {
      await this.page.getByText('Yes', { exact: true }).click();
      await this.inputRoundingDescription.fill(roundingDescription!);
    } else if (roundingApplied === false) {
      await this.page.getByText('No', { exact: true }).click();
    }
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async cancel() {
    await this.page.getByRole('link', { name: 'Cancel' }).click();
  }
}
