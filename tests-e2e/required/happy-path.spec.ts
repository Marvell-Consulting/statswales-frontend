import path from 'node:path';
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

import { test, expect, Page, Locator, Download, TestInfo } from '@playwright/test';
import { users } from '../fixtures/logins';
import { appConfig } from '../../src/config';
import { escapeRegExp } from 'lodash';
import { TZDate } from '@date-fns/tz';

const config = appConfig();
const baseUrl = config.frontend.url;

test.describe('Happy path', () => {
  test.use({ storageState: users.publisher.path });
  const title = `E2E test dataset ${new Date().toISOString()}`;

  const csvDir = path.join(__dirname, '..', 'sample-csvs', 'happy-path');
  let id: string;
  let yearCodeId: string;
  let rowRefId: string;
  let areaCodeId: string;

  const content = {
    measureTable: 'Measure table title',
    dateField: 'Date title',
    areaCodeField: 'Area code title',
    rowRefField: 'Row ref title',
    summary: 'Summary text',
    dataCollection: 'Data collection text',
    statisticalQuality: 'Statistical quality text',
    relatedReportLink: 'http://example.com',
    relatedReportLinkText: 'Example website'
  };

  async function setFile(page: Page, filepath: string) {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filepath);
  }

  async function downloadFile(page: Page, downloadButton: Locator) {
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    return await downloadPromise;
  }

  async function checkFile(testInfo: TestInfo, download: Download) {
    const filepath = path.join(testInfo.outputDir, download.suggestedFilename());
    await download.saveAs(filepath);
    const file = fs.readFileSync(filepath);
    expect(file).toBeTruthy();
  }

  test('Can fully create a new dataset', async ({ page, context }, testInfo) => {
    // start
    await page.goto('/en-GB');
    await page.getByRole('link', { name: 'Create new dataset' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish`);
    await page.getByRole('link', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/title`);

    // title
    await page.getByRole('textbox').fill(title);
    await page.getByRole('button', { name: 'Continue' }).click();
    const pageUrl = page.url();
    const match = pageUrl.match(new RegExp(`^${escapeRegExp(baseUrl)}/en-GB/publish/(.*)/upload$`));
    if (match) {
      id = match[1];
    }
    expect(pageUrl).toContain(`${baseUrl}/en-GB/publish/${id}/upload`);

    // data table upload
    await setFile(page, path.join(csvDir, 'QryHLTH1250_Data.csv'));
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/preview`);

    // check table
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/sources`);

    // input sources
    await page.getByLabel('YearCode').selectOption('Dimension');
    await page.getByLabel('AreaCode').selectOption('Dimension');
    await page.getByLabel('Data').selectOption('Data values');
    await page.getByLabel('RowRef').selectOption('Dimension');
    await page.getByLabel('Measure').selectOption('Measure or data types');
    await page.getByLabel('NoteCodes').selectOption('Note codes');
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // measure
    await page.getByRole('link', { name: 'Measure' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/measure`);
    await setFile(page, path.join(csvDir, 'QryHLTH1250_Measure-fixed.csv'));
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/measure/review`);
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/measure/name`);
    await page.getByRole('textbox').fill(content.measureTable);
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // year code
    await page.getByRole('link', { name: 'YearCode' }).click();
    const yearCodeUrl = page.url();
    const yearCodeMatch = yearCodeUrl.match(
      new RegExp(`^${escapeRegExp(baseUrl)}/en-GB/publish/${id}/dimension/(.*)$`)
    );
    if (yearCodeMatch) {
      yearCodeId = yearCodeMatch[1];
    }
    expect(yearCodeUrl).toContain(`${baseUrl}/en-GB/publish/${id}/dimension/${yearCodeId}`);
    // force: true needed as label intercepts the click
    await page.getByLabel('Dates').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dates/${yearCodeId}`);
    await page.getByLabel('Periods').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dates/${yearCodeId}/period`);
    await page.getByLabel('Financial').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dates/${yearCodeId}/period/year-format`);
    await page.getByLabel('YYYYYY', { exact: true }).click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dates/${yearCodeId}/period/type`);
    await page.getByLabel('Years').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dates/${yearCodeId}/review`);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('textbox').fill(content.dateField);
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // row ref
    await page.getByRole('link', { name: 'RowRef' }).click();
    const rowRefUrl = page.url();
    const rowRefMatch = rowRefUrl.match(new RegExp(`^${escapeRegExp(baseUrl)}/en-GB/publish/${id}/dimension/(.*)$`));
    if (rowRefMatch) {
      rowRefId = rowRefMatch[1];
    }
    expect(rowRefUrl).toContain(`${baseUrl}/en-GB/publish/${id}/dimension/${rowRefId}`);
    await page.getByLabel('Something else').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/lookup/${rowRefId}`);
    await setFile(page, path.join(csvDir, 'QryHLTH1250_RowRef-fixed.csv'));
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/lookup/${rowRefId}/review`);
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dimension/${rowRefId}/name`);
    await page.getByRole('textbox').fill(content.rowRefField);
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // area code
    await page.getByRole('link', { name: 'AreaCode' }).click();
    const areaCodeUrl = page.url();
    const areaCodeMatch = areaCodeUrl.match(
      new RegExp(`^${escapeRegExp(baseUrl)}/en-GB/publish/${id}/dimension/(.*)$`)
    );
    if (areaCodeMatch) {
      areaCodeId = areaCodeMatch[1];
    }
    expect(areaCodeUrl).toContain(`${baseUrl}/en-GB/publish/${id}/dimension/${areaCodeId}`);
    await page.getByLabel('Geography').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/lookup/${areaCodeId}/review`);
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dimension/${areaCodeId}/name`);
    await page.getByRole('textbox').fill(content.areaCodeField);
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // summary
    await page.getByRole('link', { name: 'Summary' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/summary`);
    await page.getByRole('textbox').fill(content.summary);
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // data collection
    await page.getByRole('link', { name: 'Data collection' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/collection`);
    await page.getByRole('textbox').fill(content.dataCollection);
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // statistical quality
    await page.getByRole('link', { name: 'Statistical quality' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/quality`);
    await page.getByRole('textbox').fill(content.statisticalQuality);
    await page.getByLabel('No').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // data sources
    await page.getByRole('link', { name: 'Data sources' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/providers`);
    await page.locator('.autocomplete__wrapper').click();
    await page.locator('#provider__option--1').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/providers?edit`);
    await page.getByLabel('No specific source from data provider').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/providers`);
    await page.getByLabel('No').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // related reports
    await page.getByRole('link', { name: 'Related reports' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/related`);
    await page.getByRole('textbox', { name: 'Link URL' }).fill(content.relatedReportLink);
    await page.getByRole('textbox', { name: 'Link text to appear on the webpage' }).fill(content.relatedReportLinkText);
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/related`);
    await page.getByLabel('No').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // update frequency
    await page.getByRole('link', { name: 'How often this dataset is updated' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/update-frequency`);
    await page.getByLabel('No').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    //designation
    await page.getByRole('link', { name: 'Designation' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/designation`);
    await page.getByLabel('Official statistics', { exact: true }).click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // relevant topics
    await page.getByRole('link', { name: 'Relevant topics' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/topics`);
    await page.getByLabel('Business, economy and labour market').click({ force: true });
    await page.getByLabel('Business', { exact: true }).click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // export translation
    await page.getByRole('link', { name: 'Export text fields for translation' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/translation/export`);

    const download = await downloadFile(page, page.getByRole('link', { name: 'Export CSV' }));
    const filename = download.suggestedFilename();
    await download.saveAs(path.join(testInfo.outputDir, filename));
    await page.goto(`/en-GB/publish/${id}/tasklist`);

    // update translations
    const file = fs.readFileSync(path.join(testInfo.outputDir, filename));
    const parsed = parse(file, {
      columns: true,
      bom: true
    });

    const mapped = parsed.map((row: Record<string, string>) => {
      return {
        ...row,
        cymraeg: `${row.english} - CY`
      };
    });

    const newCsv = stringify(mapped, { columns: Object.keys(parsed[0]), header: true });
    fs.writeFileSync(path.join(testInfo.outputDir, filename), newCsv);

    // import translations
    await page.getByRole('link', { name: 'Import translations' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/translation/import`);
    await setFile(page, path.join(testInfo.outputDir, filename));
    await page.getByRole('button', { name: 'Import CSV' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/translation/import`);
    expect(page.getByRole('heading')).toContainText('Check the translated text');
    await page.getByRole('link', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // preview dataset
    const pagePromise = context.waitForEvent('page');
    await page.getByRole('link', { name: 'Preview (opens in new tab)' }).click();
    const previewPage = await pagePromise;
    expect(previewPage.url()).toContain(`${baseUrl}/en-GB/publish/${id}/cube-preview`);

    // check contents
    expect(previewPage.getByText(title)).toBeTruthy();
    expect(previewPage.getByText('This is a preview of this dataset.')).toBeTruthy();
    expect(previewPage.getByText('Main information', { exact: true })).toBeTruthy();
    expect(previewPage.getByText('Overview', { exact: true })).toBeTruthy();
    expect(previewPage.getByText('Published by', { exact: true })).toBeTruthy();
    expect(previewPage.getByText(content.summary, { exact: true })).toBeTruthy();
    expect(previewPage.getByText(content.dataCollection, { exact: true })).toBeTruthy();
    expect(previewPage.getByText(content.statisticalQuality, { exact: true })).toBeTruthy();
    expect(previewPage.getByText(content.relatedReportLinkText, { exact: true })).toBeTruthy();

    // download files;
    await previewPage.click('#tab_download_dataset');
    await previewPage.click('#csv');
    await previewPage.click('#en-GB');
    const csvDownload = await downloadFile(previewPage, previewPage.getByRole('button', { name: 'Download data' }));
    await checkFile(testInfo, csvDownload);
    await previewPage.click('#parquet');
    const parquetDownload = await downloadFile(previewPage, previewPage.getByRole('button', { name: 'Download data' }));
    await checkFile(testInfo, parquetDownload);
    await previewPage.click('#excel');
    const excelDownload = await downloadFile(previewPage, previewPage.getByRole('button', { name: 'Download data' }));
    await checkFile(testInfo, excelDownload);
    await previewPage.click('#duckdb');
    const duckDBDownload = await downloadFile(previewPage, previewPage.getByRole('button', { name: 'Download data' }));
    await checkFile(testInfo, duckDBDownload);

    // data table
    // TODO: link has a leading space
    await previewPage.getByText(' Table preview [Publisher use only]').click({ force: true });
    const heading = previewPage.locator('table > thead > tr');
    expect(heading.getByText('Data Values')).toBeTruthy();
    expect(heading.getByText(content.measureTable)).toBeTruthy();
    expect(heading.getByText(content.dateField)).toBeTruthy();
    expect(heading.getByText('Start Date')).toBeTruthy();
    expect(heading.getByText('End Date')).toBeTruthy();
    expect(heading.getByText(content.areaCodeField)).toBeTruthy();
    expect(heading.getByText(content.rowRefField)).toBeTruthy();
    expect(heading.getByText('Notes')).toBeTruthy();

    // publishing
    await page.getByRole('link', { name: 'When this dataset should be published' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/schedule`);

    const now = new TZDate(new Date().toISOString(), 'Europe/London');
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hours = now.getHours();
    const mins = now.getMinutes() + 5;

    await page.getByRole('textbox', { name: 'Day' }).fill(String(day));
    await page.getByRole('textbox', { name: 'Month' }).fill(String(month));
    await page.getByRole('textbox', { name: 'Year' }).fill(String(year));
    await page.getByRole('textbox', { name: 'Hour' }).fill(String(hours));
    await page.getByRole('textbox', { name: 'Minute' }).fill(String(mins));

    await page.getByRole('button', { name: 'Continue' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

    // submit
    await page.getByRole('button', { name: 'Submit for publishing' }).click();
    expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview?scheduled=true`);
  });
});
