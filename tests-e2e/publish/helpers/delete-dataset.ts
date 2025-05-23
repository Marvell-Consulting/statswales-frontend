import { Page } from '@playwright/test';
import { appConfig } from '../../../src/config';

const config = appConfig();
const baseUrl = config.frontend.url;

export async function createEmptyDataset(page: Page, id: string) {
  await page.goto(`/en-GB/publish/${id}/tasklist`);
}
