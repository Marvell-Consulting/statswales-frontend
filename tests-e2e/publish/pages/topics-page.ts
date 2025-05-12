import type { Page } from '@playwright/test';

import { appConfig } from '../../../src/config';

const config = appConfig();
const baseUrl = config.frontend.url;

export class TopicsPage {
  constructor(public readonly page: Page) {}

  async goto(datasetId: string) {
    await this.page.goto(`${baseUrl}/en-GB/publish/${datasetId}/topics`);
  }

  async fillForm(topics: string[]) {
    for (const topic of topics) {
      const checkbox = await this.page.getByLabel(topic, { exact: true });

      if (!(await checkbox.isChecked())) {
        await checkbox.check();
      }
    }
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
