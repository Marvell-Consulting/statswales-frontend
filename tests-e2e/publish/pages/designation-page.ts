import type { Page } from '@playwright/test';

import { appConfig } from '../../../src/config';

const config = appConfig();
const baseUrl = config.frontend.url;

export class DesignationPage {
  constructor(public readonly page: Page) {}

  async goto(datasetId: string) {
    await this.page.goto(`${baseUrl}/en-GB/publish/${datasetId}/designation`);
  }

  async fillForm(designation: string) {
    await this.page.getByText(designation, { exact: true }).click();
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
