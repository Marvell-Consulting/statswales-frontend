import 'dotenv/config';

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { chromium, Page } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

import { add } from 'date-fns';

import { config } from '../src/shared/config';
import { TranslationDTO } from '../src/shared/dtos/translations';
import { solos } from '../tests-e2e/fixtures/logins';
import {
  startNewDataset,
  selectUserGroup,
  provideDatasetTitle,
  uploadDataTable,
  confirmDataTable,
  assignColumnTypes,
  configureMeasure,
  configureDimension,
  configureLookupDimension,
  completeSummary,
  completeCollection,
  completeQuality,
  completeProviders,
  completeRelatedReports,
  completeDesignation,
  completeTopics,
  completeUpdateFrequency,
  completePublicationDate,
  submitForApproval,
  approvePublication,
  waitForPublication,
  uploadFile,
  checkTasklistItemComplete
} from '../tests-e2e/publish/helpers/publishing-steps';
import { DebugDatasetConfig } from './replay-dataset-types';

const baseUrl = config.frontend.publisher.url;
const sampleCsvsDir = path.resolve(__dirname, '..', 'tests-e2e', 'sample-csvs');
const solo = solos[0];

async function loginAs(page: Page, user: { username: string; path: string }): Promise<void> {
  await page.goto('/en-GB/auth/login');
  await page.getByRole('link', { name: 'Form' }).click();
  await page.getByLabel('Username').fill(user.username);
  await page.getByRole('button', { name: 'Continue' }).click();
  const cookieButton = page.getByRole('button', { name: 'Accept all cookies' });
  if (await cookieButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cookieButton.click();
  }
  await page.context().storageState({ path: user.path });
}

async function ensureAuth(page: Page): Promise<void> {
  await page.goto('/en-GB');
  if (page.url().includes('/auth/')) {
    console.log(`Auth state expired — logging in as ${solo.username}...`);
    await loginAs(page, solo);
    console.log('Auth state saved.');
  } else {
    console.log(`Authenticated as ${solo.username}`);
  }
}

async function completeTranslations(page: Page, datasetId: string, tmpDir: string) {
  await page.getByRole('link', { name: 'Export text fields for translation' }).click();

  const downloadButton = page.getByRole('link', { name: 'Export CSV' });
  const downloadPromise = page.waitForEvent('download');
  await downloadButton.click();
  const download = await downloadPromise;
  const translationFilePath = path.join(tmpDir, download.suggestedFilename());
  await download.saveAs(translationFilePath);
  await page.goto(`/en-GB/publish/${datasetId}/tasklist`);
  await checkTasklistItemComplete(page, 'Export text fields for translation');

  const file = await fsp.readFile(translationFilePath);
  const parsed = parse<TranslationDTO>(file, { columns: true, bom: true });

  const mapped = parsed.map((row: TranslationDTO): TranslationDTO => {
    return { ...row, cymraeg: `${row.english} - CY` };
  });

  const newCsv = stringify(mapped, { columns: Object.keys(parsed[0]), header: true });
  await fsp.writeFile(translationFilePath, newCsv);

  await page.getByRole('link', { name: 'Import translations' }).click();
  await uploadFile(page, translationFilePath);
  await page.getByRole('button', { name: 'Import CSV' }).click();
  await page.getByRole('heading').filter({ hasText: 'Check the translated text' }).waitFor();
  await page.getByRole('link', { name: 'Continue' }).click();
  await checkTasklistItemComplete(page, 'Import translations');
}

function resolveFilename(datasetDir: string, filename: string): string {
  return path.join('.debug', datasetDir, filename);
}

function validateFiles(datasetDir: string, cfg: DebugDatasetConfig): void {
  const files = [cfg.dataFile, cfg.measure.filename];
  for (const dim of cfg.dimensions) {
    if (dim.type === 'lookup' && dim.filename) {
      files.push(dim.filename);
    }
  }

  for (const file of files) {
    const resolved = path.join(sampleCsvsDir, '.debug', datasetDir, file);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Missing file: ${resolved}`);
    }
  }
}

async function main() {
  const datasetDir = process.argv[2];
  if (!datasetDir) {
    console.error('Usage: npm run replay-dataset -- <dataset-dir-name>');
    console.error('Example: npm run replay-dataset -- SW-1188');
    process.exit(1);
  }

  const configPath = path.resolve(sampleCsvsDir, '.debug', datasetDir, 'config.ts');
  if (!fs.existsSync(configPath)) {
    console.error(`Config not found: ${configPath}`);
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cfg = require(configPath).default as DebugDatasetConfig;
  validateFiles(datasetDir, cfg);

  const headless = process.argv.includes('--headless');
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'replay-dataset-'));

  console.log(`Replaying dataset from: tests-e2e/sample-csvs/.debug/${datasetDir}/`);
  console.log(`Temp dir: ${tmpDir}`);

  const authDir = path.dirname(solo.path);
  fs.mkdirSync(authDir, { recursive: true });

  const browser = await chromium.launch({ headless });
  const storageState = fs.existsSync(solo.path) ? solo.path : undefined;
  const context = await browser.newContext({ baseURL: baseUrl, storageState });
  context.setDefaultTimeout(120_000);
  const page = await context.newPage();

  try {
    await ensureAuth(page);

    // Phase 1: Create dataset
    console.log('Starting new dataset...');
    await startNewDataset(page);
    await selectUserGroup(page, 'E2E tests');
    const datasetId = await provideDatasetTitle(page, cfg.title);
    console.log(`Dataset created: ${datasetId}`);

    // Phase 2: Upload data table
    console.log('Uploading data table...');
    await uploadDataTable(page, datasetId, resolveFilename(datasetDir, cfg.dataFile));
    await confirmDataTable(page, datasetId);
    await assignColumnTypes(page, datasetId, cfg.columnAssignments);

    // Phase 3: Configure measure
    console.log('Configuring measure...');
    await configureMeasure(page, datasetId, resolveFilename(datasetDir, cfg.measure.filename));

    // Phase 4: Configure dimensions
    for (const dim of cfg.dimensions) {
      console.log(`Configuring dimension: ${dim.dimensionName} (${dim.type})...`);
      if (dim.type === 'date') {
        await configureDimension(page, datasetId, {
          originalColName: dim.originalColName,
          dimensionName: dim.dimensionName,
          optionSelections: dim.optionSelections!
        });
      } else {
        await configureLookupDimension(page, datasetId, {
          originalColName: dim.originalColName,
          dimensionName: dim.dimensionName,
          optionSelections: [],
          filename: resolveFilename(datasetDir, dim.filename!)
        });
      }
    }

    // Phase 5: Complete metadata
    console.log('Filling in metadata...');
    await completeSummary(page, datasetId, cfg.metadata.summary);
    await completeCollection(page, datasetId, cfg.metadata.collection);
    await completeQuality(page, datasetId, cfg.metadata.quality, cfg.metadata.rounding);
    await completeProviders(page, datasetId, cfg.metadata.providerName, cfg.metadata.sourceName);
    await completeRelatedReports(page, datasetId, cfg.metadata.reports);
    await completeDesignation(page, datasetId, cfg.metadata.designation);
    await completeTopics(page, datasetId, cfg.metadata.topics);
    const nextUpdate = add(new Date(), { years: 1 });
    await completeUpdateFrequency(page, datasetId, {
      year: nextUpdate.getFullYear(),
      month: nextUpdate.getMonth() + 1,
      day: nextUpdate.getDate()
    });

    // Phase 6: Translations
    console.log('Handling translations...');
    await completeTranslations(page, datasetId, tmpDir);

    // Phase 7: Publish
    const minutes = cfg.publishMinutesFromNow ?? 2;
    console.log(`Scheduling publication ${minutes} minute(s) from now...`);
    await completePublicationDate(page, datasetId, minutes);
    await submitForApproval(page, datasetId);
    await approvePublication(page, datasetId);

    console.log('Waiting for publication...');
    await waitForPublication(page, datasetId);

    console.log('\nDataset published successfully!');
    console.log(`  Publisher: ${baseUrl}/en-GB/publish/${datasetId}/overview`);
    console.log(`  Consumer:  ${config.frontend.consumer.url}/en-GB/${datasetId}/start`);
  } finally {
    await context.close();
    await browser.close();
    await fsp.rm(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('Failed to replay dataset:', err);
  process.exit(1);
});
