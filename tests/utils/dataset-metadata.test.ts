import { getDatasetMetadata, metadataToCSV } from '../../src/shared/utils/dataset-metadata';
import { SingleLanguageDataset } from '../../src/shared/dtos/single-language/dataset';
import { SingleLanguageRevision } from '../../src/shared/dtos/single-language/revision';
import { Designation } from '../../src/shared/enums/designation';
import { Locale } from '../../src/shared/enums/locale';
import { NextUpdateType } from '../../src/shared/enums/next-update-type';
import { i18next } from '../../src/shared/middleware/translation';

const makeRevision = (overrides: Record<string, unknown> = {}): SingleLanguageRevision =>
  ({
    id: 'rev-1',
    revision_index: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'test-user',
    metadata: {
      title: 'Test Dataset',
      summary: 'A summary',
      quality: 'Good quality',
      collection: 'Collection info',
      rounding_description: ''
    },
    designation: Designation.Official,
    rounding_applied: false,
    providers: [{ provider_name: 'Test Provider', source_name: 'Test Source' }],
    related_links: [{ label_en: 'Link EN', label_cy: 'Link CY', url: 'https://example.com' }],
    ...overrides
  }) as unknown as SingleLanguageRevision;

const makeDataset = (overrides: Partial<SingleLanguageDataset> = {}): SingleLanguageDataset => ({
  id: 'ds-1',
  created_at: '2024-01-01T00:00:00Z',
  created_by: 'test-user',
  ...overrides
});

describe('getDatasetMetadata', () => {
  it('returns timePeriod with both start and end when revision has coverage dates', async () => {
    const revision = makeRevision({
      coverage_start_date: '2020-04-01T00:00:00Z',
      coverage_end_date: '2024-03-31T00:00:00Z'
    });
    const dataset = makeDataset();

    const result = await getDatasetMetadata(dataset, revision, false);

    expect(result.keyInfo.timePeriod.start).toBe('2020-04-01T00:00:00Z');
    expect(result.keyInfo.timePeriod.end).toBe('2024-03-31T00:00:00Z');
  });

  it('returns timePeriod with undefined start/end when revision has no coverage dates', async () => {
    const revision = makeRevision();
    const dataset = makeDataset();

    const result = await getDatasetMetadata(dataset, revision, false);

    expect(result.keyInfo.timePeriod.start).toBeUndefined();
    expect(result.keyInfo.timePeriod.end).toBeUndefined();
  });

  it('returns correct timePeriod when only start is present', async () => {
    const revision = makeRevision({ coverage_start_date: '2020-01-01T00:00:00Z' });
    const dataset = makeDataset();

    const result = await getDatasetMetadata(dataset, revision, false);

    expect(result.keyInfo.timePeriod.start).toBe('2020-01-01T00:00:00Z');
    expect(result.keyInfo.timePeriod.end).toBeUndefined();
  });

  it('returns sanitised HTML when renderHtml is true', async () => {
    const revision = makeRevision({
      metadata: {
        title: 'Test',
        summary: '**bold summary**',
        quality: '_italic quality_',
        collection: 'collection',
        rounding_description: ''
      }
    });
    const dataset = makeDataset();

    const result = await getDatasetMetadata(dataset, revision, true);

    expect(result.about.summary).toContain('<strong>bold summary</strong>');
    expect(result.about.quality).toContain('<em>italic quality</em>');
  });

  it('returns raw markdown strings when renderHtml is false', async () => {
    const revision = makeRevision({
      metadata: {
        title: 'Test',
        summary: '**bold summary**',
        quality: '_italic quality_',
        collection: 'collection',
        rounding_description: ''
      }
    });
    const dataset = makeDataset();

    const result = await getDatasetMetadata(dataset, revision, false);

    expect(result.about.summary).toBe('**bold summary**');
    expect(result.about.quality).toBe('_italic quality_');
  });

  it('includes rounding description when rounding_applied is true', async () => {
    const revision = makeRevision({
      rounding_applied: true,
      metadata: {
        title: 'Test',
        summary: '',
        quality: '',
        collection: '',
        rounding_description: 'Rounded to nearest 5'
      }
    });
    const dataset = makeDataset();

    const result = await getDatasetMetadata(dataset, revision, false);

    expect(result.about.roundingApplied).toBe(true);
    expect(result.about.roundingDescription).toBe('Rounded to nearest 5');
  });

  it('maps providers correctly', async () => {
    const revision = makeRevision({
      providers: [
        { provider_name: 'Provider A', source_name: 'Source A' },
        { provider_name: 'Provider B', source_name: 'Source B' }
      ]
    });
    const dataset = makeDataset();

    const result = await getDatasetMetadata(dataset, revision, false);

    expect(result.keyInfo.providers).toEqual([
      { provider_name: 'Provider A', source_name: 'Source A' },
      { provider_name: 'Provider B', source_name: 'Source B' }
    ]);
  });

  it('maps related links correctly', async () => {
    const revision = makeRevision({
      related_links: [{ label_en: 'Report', label_cy: 'Adroddiad', url: 'https://example.com/report' }]
    });
    const dataset = makeDataset();

    const result = await getDatasetMetadata(dataset, revision, false);

    expect(result.about.relatedLinks).toEqual([
      { label_en: 'Report', label_cy: 'Adroddiad', url: 'https://example.com/report' }
    ]);
  });
});

describe('metadataToCSV', () => {
  beforeAll(async () => {
    await i18next.init;
  });

  it('includes time period row when timePeriod.start is present', async () => {
    const revision = makeRevision({
      coverage_start_date: '2020-04-01T00:00:00Z',
      coverage_end_date: '2024-03-31T00:00:00Z'
    });
    const metadata = await getDatasetMetadata(makeDataset(), revision, false);
    const csv = metadataToCSV(metadata, Locale.EnglishGb);

    const timePeriodRow = csv.find((row) => row[0] === i18next.t('dataset_view.key_information.time_covered'));
    expect(timePeriodRow).toBeDefined();
  });

  it('omits time period row when timePeriod.start is undefined', async () => {
    const revision = makeRevision();
    const metadata = await getDatasetMetadata(makeDataset(), revision, false);
    const csv = metadataToCSV(metadata, Locale.EnglishGb);

    const timePeriodRow = csv.find((row) => row[0] === i18next.t('dataset_view.key_information.time_covered'));
    expect(timePeriodRow).toBeUndefined();
  });

  it('formats dates correctly for English locale', async () => {
    const revision = makeRevision({
      coverage_start_date: '2020-04-01T00:00:00Z',
      coverage_end_date: '2024-03-31T00:00:00Z'
    });
    const metadata = await getDatasetMetadata(makeDataset(), revision, false);
    const csv = metadataToCSV(metadata, Locale.EnglishGb);

    const timePeriodRow = csv.find((row) => row[0] === i18next.t('dataset_view.key_information.time_covered'));
    expect(timePeriodRow).toBeDefined();
    // The row value should contain formatted date text
    expect(timePeriodRow![1]).toBeTruthy();
  });

  it('does not throw when next update has invalid date components', async () => {
    const revision = makeRevision({
      update_frequency: {
        update_type: NextUpdateType.Update,
        date: { day: undefined, month: undefined, year: undefined }
      }
    });
    const metadata = await getDatasetMetadata(makeDataset(), revision, false);

    expect(() => metadataToCSV(metadata, Locale.EnglishGb)).not.toThrow();

    const csv = metadataToCSV(metadata, Locale.EnglishGb);
    const nextUpdateRow = csv.find((row) => row[0] === i18next.t('dataset_view.key_information.next_update'));
    expect(nextUpdateRow).toBeDefined();
    expect(nextUpdateRow![1]).toBe('');
  });

  it('formats year-only next update correctly', async () => {
    const revision = makeRevision({
      update_frequency: {
        update_type: NextUpdateType.Update,
        date: { day: undefined, month: undefined, year: '2027' }
      }
    });
    const metadata = await getDatasetMetadata(makeDataset(), revision, false);
    const csv = metadataToCSV(metadata, Locale.EnglishGb);

    const nextUpdateRow = csv.find((row) => row[0] === i18next.t('dataset_view.key_information.next_update'));
    expect(nextUpdateRow).toBeDefined();
    expect(nextUpdateRow![1]).toBe('2027');
  });

  it('formats month-and-year next update correctly', async () => {
    const revision = makeRevision({
      update_frequency: {
        update_type: NextUpdateType.Update,
        date: { day: undefined, month: '06', year: '2027' }
      }
    });
    const metadata = await getDatasetMetadata(makeDataset(), revision, false);
    const csv = metadataToCSV(metadata, Locale.EnglishGb);

    const nextUpdateRow = csv.find((row) => row[0] === i18next.t('dataset_view.key_information.next_update'));
    expect(nextUpdateRow).toBeDefined();
    expect(nextUpdateRow![1]).toBe('June 2027');
  });
});
