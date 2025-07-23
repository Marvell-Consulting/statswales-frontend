import type { Page, Locator } from '@playwright/test';

import { appConfig } from '../../../src/shared/config';

const config = appConfig();
const baseUrl = config.frontend.publisher.url;

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

    // Note - playwright seems to get stuck in a loop when using getByLabel() with radio buttons that expand to
    // reveal content. It seems to be because the click position changes on DOM render. Using getByText instead.
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
}
