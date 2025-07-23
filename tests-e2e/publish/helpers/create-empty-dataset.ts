import { Page } from '@playwright/test';
import { appConfig } from '../../../src/shared/config';
import { TitlePage } from '../pages/title-page';
import { escapeRegExp } from 'lodash';

const config = appConfig();
const baseUrl = config.frontend.publisher.url;

export async function createEmptyDataset(page: Page, title: string) {
  await page.goto('/en-GB/publish');
  await page.getByRole('link', { name: 'Continue' }).click();
  await page.getByText('E2E tests', { exact: true }).click({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  const titlePage = new TitlePage(page);
  await titlePage.fillForm(`${title} - ${new Date().toISOString()}`);
  await titlePage.submit();
  const url = page.url();
  const re = new RegExp(`^${escapeRegExp(baseUrl)}/en-GB/publish/(.*)/upload$`);
  const matches = url.match(re);
  if (matches) {
    const id = matches[1];
    return id;
  }
  throw new Error('Unable to create dataset');
}
