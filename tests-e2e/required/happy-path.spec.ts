import path from 'node:path';
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { escapeRegExp } from 'lodash';
import { test, expect, Page, Locator, Download, TestInfo } from '@playwright/test';
import { TZDate } from '@date-fns/tz';
import { add } from 'date-fns';

import { users } from '../fixtures/logins';
import { config } from '../../src/shared/config';
import { TranslationDTO } from '../../src/shared/dtos/translations';

const baseUrl = config.frontend.publisher.url;
const csvDir = path.join(__dirname, '..', 'sample-csvs', 'happy-path');

async function setFile(page: Page, filepath: string) {
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator('input[type="file"]').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filepath);
}

test.describe('Happy path', () => {
  // approval tests are dependant on dataset submission so disable fullyParallel mode  in this file
  test.describe.configure({ mode: 'default' });

  const title = `E2E happy path dataset ${new Date().toISOString()}`;
  let id: string;

  test.describe('Publisher - create', () => {
    // log in as test publisher
    test.use({ storageState: users.publisher.path });

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

    async function downloadFile(page: Page, downloadButton: Locator) {
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      return await downloadPromise;
    }

    async function checkFile(testInfo: TestInfo, download: Download) {
      const filepath = path.join(testInfo.outputDir, download.suggestedFilename());
      await download.saveAs(filepath);
      const file = fs.readFileSync(filepath);
      await expect(file).toBeTruthy();
    }

    test('Can fully create a new dataset', async ({ page, context }, testInfo) => {
      // start
      await page.goto('/en-GB');
      await page.getByRole('link', { name: 'Create new dataset' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish`);
      await page.getByRole('link', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/group`);

      // Select group
      await page.getByText('E2E tests', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/title`);

      // title
      await page.getByRole('textbox').fill(title);
      await page.getByRole('button', { name: 'Continue' }).click();
      const pageUrl = page.url();
      const match = pageUrl.match(new RegExp(`^${escapeRegExp(baseUrl)}/en-GB/publish/(.*)/upload$`));
      if (match) {
        id = match[1];
      }
      await expect(pageUrl).toContain(`${baseUrl}/en-GB/publish/${id}/upload`);

      // data table upload
      await setFile(page, path.join(csvDir, 'QryHLTH1250_Data.csv'));
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.waitForLoadState('networkidle');

      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/preview`);

      // check table
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/sources`);

      // input sources
      await page.getByLabel('YearCode').selectOption('Dimension');
      await page.getByLabel('AreaCode').selectOption('Dimension');
      await page.getByLabel('Data').selectOption('Data values');
      await page.getByLabel('RowRef').selectOption('Dimension');
      await page.getByLabel('Measure').selectOption('Measure or data types');
      await page.getByLabel('NoteCodes').selectOption('Note codes');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // measure
      await page.getByRole('link', { name: 'Measure' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/measure`);
      await setFile(page, path.join(csvDir, 'QryHLTH1250_Measure-fixed.csv'));
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/measure/review`);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // year code
      await page.getByRole('link', { name: 'YearCode' }).click();
      const yearCodeUrl = page.url();
      const yearCodeMatch = yearCodeUrl.match(
        new RegExp(`^${escapeRegExp(baseUrl)}/en-GB/publish/${id}/dimension/(.*)$`)
      );
      if (yearCodeMatch) {
        yearCodeId = yearCodeMatch[1];
      }
      await expect(yearCodeUrl).toContain(`${baseUrl}/en-GB/publish/${id}/dimension/${yearCodeId}`);
      // force: true needed as label intercepts the click
      await page.getByLabel('Dates').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dates/${yearCodeId}`);
      await page.getByLabel(/^Periods/).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dates/${yearCodeId}/period`);
      await page.getByLabel('Financial').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dates/${yearCodeId}/period/year-format`);
      await page.getByLabel('YYYYYY', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dates/${yearCodeId}/period/type`);
      await page.getByLabel('Years').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dates/${yearCodeId}/review`);
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('textbox').fill(content.dateField);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // row ref
      await page.getByRole('link', { name: 'RowRef' }).click();
      const rowRefUrl = page.url();
      const rowRefMatch = rowRefUrl.match(new RegExp(`^${escapeRegExp(baseUrl)}/en-GB/publish/${id}/dimension/(.*)$`));
      if (rowRefMatch) {
        rowRefId = rowRefMatch[1];
      }
      await expect(rowRefUrl).toContain(`${baseUrl}/en-GB/publish/${id}/dimension/${rowRefId}`);
      await page.getByLabel('Something else').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/lookup/${rowRefId}`);
      await setFile(page, path.join(csvDir, 'QryHLTH1250_RowRef-fixed.csv'));
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/lookup/${rowRefId}/review`);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dimension/${rowRefId}/name`);
      await page.getByRole('textbox').fill(content.rowRefField);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // area code
      await page.getByRole('link', { name: 'AreaCode' }).click();
      const areaCodeUrl = page.url();
      const areaCodeMatch = areaCodeUrl.match(
        new RegExp(`^${escapeRegExp(baseUrl)}/en-GB/publish/${id}/dimension/(.*)$`)
      );
      if (areaCodeMatch) {
        areaCodeId = areaCodeMatch[1];
      }

      // For the happy path test treat area as a text dimension in this case
      await expect(areaCodeUrl).toContain(`${baseUrl}/en-GB/publish/${id}/dimension/${areaCodeId}`);
      await page.getByLabel('Text').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/lookup/${areaCodeId}/review`);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/dimension/${areaCodeId}/name`);
      await page.getByRole('textbox').fill(content.areaCodeField);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // summary
      await page.getByRole('link', { name: 'Summary' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/summary`);
      await page.getByRole('textbox').fill(content.summary);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // data collection
      await page.getByRole('link', { name: 'Data collection' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/collection`);
      await page.getByRole('textbox').fill(content.dataCollection);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // statistical quality
      await page.getByRole('link', { name: 'Statistical quality' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/quality`);
      await page.getByRole('textbox').fill(content.statisticalQuality);
      await page.getByLabel('No').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // data sources
      await page.getByRole('link', { name: 'Data sources' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/providers`);
      await page.locator('.autocomplete__wrapper').click();
      await page.locator('#provider_id__option--1').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/providers?edit`);
      await page.getByLabel('No specific source from data provider').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/providers`);
      await page.getByLabel('No').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // related reports
      await page.getByRole('link', { name: 'Related reports' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/related`);
      await page.getByRole('textbox', { name: 'Link URL' }).fill(content.relatedReportLink);
      await page
        .getByRole('textbox', { name: 'Link text to appear on the webpage' })
        .fill(content.relatedReportLinkText);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/related`);
      await page.getByLabel('No').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // update frequency
      await page.getByRole('link', { name: 'If this dataset will be updated or replaced in the future' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/update-frequency`);
      await page
        .getByLabel('This dataset is not expected to be updated or replaced in the future')
        .click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      //designation
      await page.getByRole('link', { name: 'Designation' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/designation`);
      await page.getByLabel('Official statistics', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // relevant topics
      await page.getByRole('link', { name: 'Relevant topics' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/topics`);
      await page.getByLabel('Business, economy and labour market').click({ force: true });
      await page.getByLabel('Business', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // export translation
      await page.getByRole('link', { name: 'Export text fields for translation' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/translation/export`);

      const download = await downloadFile(page, page.getByRole('link', { name: 'Export CSV' }));
      const filename = download.suggestedFilename();
      await download.saveAs(path.join(testInfo.outputDir, filename));
      await page.goto(`/en-GB/publish/${id}/tasklist`);

      // update translations
      const file = fs.readFileSync(path.join(testInfo.outputDir, filename));
      const parsed = parse<TranslationDTO>(file, { columns: true, bom: true });

      const mapped = parsed.map((row: TranslationDTO): TranslationDTO => {
        return { ...row, cymraeg: `${row.english} - CY` };
      });

      const newCsv = stringify(mapped, { columns: Object.keys(parsed[0]), header: true });
      fs.writeFileSync(path.join(testInfo.outputDir, filename), newCsv);

      // import translations
      await page.getByRole('link', { name: 'Import translations' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/translation/import`);
      await setFile(page, path.join(testInfo.outputDir, filename));
      await page.getByRole('button', { name: 'Import CSV' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/translation/import`);
      await expect(page.getByRole('heading')).toContainText('Check the translated text');
      await page.getByRole('link', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      // preview dataset
      const pagePromise = context.waitForEvent('page');
      await page.getByRole('link', { name: 'Preview (opens in new tab)' }).click();
      const previewPage = await pagePromise;
      await expect(previewPage.url()).toContain(`${baseUrl}/en-GB/publish/${id}/cube-preview`);

      // check contents
      await expect(previewPage.getByText(title)).toBeTruthy();
      await expect(previewPage.getByText('This is a preview of this dataset.')).toBeTruthy();
      await expect(previewPage.getByText('Main information', { exact: true })).toBeTruthy();
      await expect(previewPage.getByText('Overview', { exact: true })).toBeTruthy();
      await expect(previewPage.getByText('Published by', { exact: true })).toBeTruthy();
      await expect(previewPage.getByText(content.summary, { exact: true })).toBeTruthy();
      await expect(previewPage.getByText(content.dataCollection, { exact: true })).toBeTruthy();
      await expect(previewPage.getByText(content.statisticalQuality, { exact: true })).toBeTruthy();
      await expect(previewPage.getByText(content.relatedReportLinkText, { exact: true })).toBeTruthy();

      // download files
      await previewPage.click('#tab_download_dataset');
      await previewPage.getByRole('button', { name: 'Download data' }).waitFor({ state: 'visible' });
      const csvDownload = await downloadFile(previewPage, previewPage.getByRole('button', { name: 'Download data' }));
      await checkFile(testInfo, csvDownload);
      await previewPage.click('#json', { force: true });
      const jsonDownload = await downloadFile(previewPage, previewPage.getByRole('button', { name: 'Download data' }));
      await checkFile(testInfo, jsonDownload);
      await previewPage.click('#xlsx', { force: true });
      const excelDownload = await downloadFile(previewPage, previewPage.getByRole('button', { name: 'Download data' }));
      await checkFile(testInfo, excelDownload);

      // data table
      await previewPage.click('#tab_data');
      const heading = previewPage.locator('table > thead > tr');
      await expect(heading.getByText('Data Values')).toBeTruthy();
      await expect(heading.getByText(content.measureTable)).toBeTruthy();
      await expect(heading.getByText(content.dateField)).toBeTruthy();
      await expect(heading.getByText('Start Date')).toBeTruthy();
      await expect(heading.getByText('End Date')).toBeTruthy();
      await expect(heading.getByText(content.areaCodeField)).toBeTruthy();
      await expect(heading.getByText(content.rowRefField)).toBeTruthy();
      await expect(heading.getByText('Notes')).toBeTruthy();

      // publishing
      await page.getByRole('link', { name: 'When this dataset should be published' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/schedule`);

      // set publish date 1 min in the future to reduce time waiting for archive/unpublish tests later
      const now = new TZDate(new Date().toISOString(), 'Europe/London');
      const theFuture = add(now, { minutes: 1 });

      const day = theFuture.getDate();
      const month = theFuture.getMonth() + 1;
      const year = theFuture.getFullYear();
      const hours = theFuture.getHours();
      const mins = theFuture.getMinutes();

      await page.getByRole('textbox', { name: 'Day' }).fill(String(day));
      await page.getByRole('textbox', { name: 'Month' }).fill(String(month));
      await page.getByRole('textbox', { name: 'Year' }).fill(String(year));
      await page.getByRole('textbox', { name: 'Hour' }).fill(String(hours));
      await page.getByRole('textbox', { name: 'Minute' }).fill(String(mins));

      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);
    });
  });

  test.describe('Publisher - request publication', () => {
    test.use({ storageState: users.publisher.path });

    test('Submit dataset for approval', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${id}/tasklist`);
      await page.getByRole('button', { name: 'Submit for approval' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset submitted for approval')).toBeTruthy();

      await page.goto('/en-GB');
      await expect(page.getByRole('link', { name: title })).toBeVisible();
    });
  });

  test.describe('Approver - publication rejection', () => {
    test.use({ storageState: users.approver.path });

    test('Reject dataset publication', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Respond to publishing request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/task-decision`);

      const rejectionReason = 'Testing dataset publication rejection';
      await page.getByLabel('No').click({ force: true });
      await page.getByRole('textbox').fill(rejectionReason);
      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset was not approved for publishing').first()).toBeVisible();
      await expect(page.getByText(rejectionReason).first()).toBeVisible();
    });
  });

  test.describe('Publisher - resubmit', () => {
    test.use({ storageState: users.publisher.path });

    test('Update and resubmit dataset for approval', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Fix issues with dataset' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      await page.getByRole('button', { name: 'Submit for approval' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset submitted for approval')).toBeTruthy();
    });
  });

  test.describe('Approver - publication approval', () => {
    test.use({ storageState: users.approver.path });

    test('Approve dataset publication', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Respond to publishing request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/task-decision`);

      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset approved for publishing').first()).toBeVisible();
    });
  });

  test.describe('Publisher - request archive', () => {
    test.use({ storageState: users.publisher.path });
    test.describe.configure({ timeout: 60 * 1000 }); // wait up to 1 min for dataset to be published

    test('Wait for dataset to be published', async ({ page }) => {
      await page.goto(`${baseUrl}/en-GB/publish/${id}/overview`);

      const statusBadges = page.locator('.status-badges');
      let isPublished = false;

      while (!isPublished) {
        await page.waitForTimeout(5000); // refresh page every 5 seconds until the dataset is published
        await page.reload();
        isPublished = await statusBadges.getByText('Published').isVisible();
      }
    });

    test('Request dataset archiving', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Label dataset as archived' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/archive`);
      await expect(page.getByText('Why should this dataset be labelled as archived?')).toBeVisible();

      const archiveReason = 'No longer updated';
      await page.getByRole('textbox').fill(archiveReason);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset archiving requested').first()).toBeVisible();
    });
  });

  test.describe('Approver - archive approval', () => {
    test.use({ storageState: users.approver.path });

    test('Approve dataset archiving', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Respond to archive request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/task-decision`);

      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset approved for archiving').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Archived dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Published', { exact: true })).toBeVisible();
    });
  });

  test.describe('Publisher - request unarchive', () => {
    test.use({ storageState: users.publisher.path });

    test('Request dataset unarchiving', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Unarchive dataset' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/unarchive`);
      await expect(page.getByText('Why should this dataset be unarchived?')).toBeVisible();

      const unarchiveReason = 'Mistakenly archived';
      await page.getByRole('textbox').fill(unarchiveReason);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset unarchiving requested').first()).toBeVisible();
    });
  });

  test.describe('Approver - unarchive approval', () => {
    test.use({ storageState: users.approver.path });

    test('Approve dataset unarchiving', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();
      await expect(page.getByText('Mistakenly archived').first()).toBeVisible();

      await page.getByRole('link', { name: 'Respond to unarchive request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/task-decision`);

      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset approved for unarchiving').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Live dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Published', { exact: true })).toBeVisible();
    });
  });

  test.describe('Publisher - request unpublish', () => {
    test.use({ storageState: users.publisher.path });

    test('Request dataset be temporarily unpublished', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Temporarily unpublish dataset' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/unpublish`);
      await expect(page.getByText('Why should this dataset be temporarily unpublished?')).toBeVisible();

      const unpublishReason = 'Need to fix a mistake';
      await page.getByRole('textbox').fill(unpublishReason);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset unpublishing requested').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Live dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Unpublish requested', { exact: true })).toBeVisible();
    });
  });

  test.describe('Approver - unpublish approval', () => {
    test.use({ storageState: users.approver.path });

    test('Approve dataset unpublishing', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();
      await expect(page.getByText('Need to fix a mistake').first()).toBeVisible();

      await page.getByRole('link', { name: 'Respond to unpublishing request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/task-decision`);

      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset approved for unpublishing').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Offline dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Unpublished', { exact: true })).toBeVisible();
    });
  });

  test.describe('Publisher - request republish', () => {
    test.use({ storageState: users.publisher.path });

    test('Update unpublished dataset and republish', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Update this dataset' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      await page.getByRole('link', { name: 'When this update should be published' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/schedule`);

      const now = new TZDate(new Date().toISOString(), 'Europe/London');
      const theFuture = add(now, { minutes: 1 });
      const day = theFuture.getDate();
      const month = theFuture.getMonth() + 1;
      const year = theFuture.getFullYear();
      const hours = theFuture.getHours();
      const mins = theFuture.getMinutes();

      await page.getByRole('textbox', { name: 'Day' }).fill(String(day));
      await page.getByRole('textbox', { name: 'Month' }).fill(String(month));
      await page.getByRole('textbox', { name: 'Year' }).fill(String(year));
      await page.getByRole('textbox', { name: 'Hour' }).fill(String(hours));
      await page.getByRole('textbox', { name: 'Minute' }).fill(String(mins));

      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);

      await page.getByRole('button', { name: 'Submit for approval' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset submitted for approval')).toBeTruthy();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Offline dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Pending approval', { exact: true })).toBeVisible();
    });
  });

  test.describe('Approver - republication approval', () => {
    test.use({ storageState: users.approver.path });

    test('Approve dataset update publication', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Respond to publishing request' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/task-decision`);

      await page.getByLabel('Yes').click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/overview`);
      await expect(page.getByText('Dataset approved for publishing').first()).toBeVisible();

      const statusBadges = page.locator('.status-badges');
      await expect(statusBadges.getByText('Live dataset', { exact: true })).toBeVisible();
      await expect(statusBadges.getByText('Update scheduled', { exact: true })).toBeVisible();
    });
  });

  test('Wait for dataset to be published', async ({ page }) => {
    await page.goto(`${baseUrl}/en-GB/publish/${id}/overview`);

    const statusBadges = page.locator('.status-badges');
    let isPublished = false;

    while (!isPublished) {
      await page.waitForTimeout(5000); // refresh page every 5 seconds until the dataset is published
      await page.reload();
      isPublished = await statusBadges.getByText('Published').isVisible();
    }
  });

  test.describe('Publisher - dataset update', () => {
    test.use({ storageState: users.publisher.path });

    test('Start the update', async ({ page }) => {
      await page.goto(`/en-GB`);
      await page.getByRole('link', { name: title }).click();
      await expect(page.getByText(title)).toBeTruthy();

      await page.getByRole('link', { name: 'Update this dataset' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/tasklist`);
    });

    test('Update the data table', async ({ page }) => {
      await page.getByRole('link', { name: 'Data table' }).click();
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/update-type`);

      await page.getByText('Add new data only', { exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Continue' }).click();

      await setFile(page, path.join(csvDir, 'data-update.csv'));
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.waitForLoadState('networkidle');

      // check update table
      await expect(page.url()).toContain(`${baseUrl}/en-GB/publish/${id}/preview`);
      await page.getByRole('button', { name: 'Continue' }).click();

      const tasklistItem = await page.locator('li', { hasText: 'Data table' });
      await expect(tasklistItem.locator('.govuk-tag').first()).toHaveText('Updated');
    });
  });
});
