import { SingleLanguageDataset } from '../dtos/single-language/dataset';
import { SingleLanguageRevision } from '../dtos/single-language/revision';

import { markdownToSafeHTML } from './markdown-to-html';
import { isPublished } from './revision';
import { PreviewMetadata } from '../interfaces/preview-metadata';
import { t } from 'i18next';
import { Locale } from '../enums/locale';
import { dateFormat } from '../../consumer/middleware/services';
import { NextUpdateType } from '../enums/next-update-type';
import { parse } from 'date-fns';

export const getDatasetMetadata = async (
  dataset: SingleLanguageDataset,
  revision: SingleLanguageRevision,
  renderHtml: boolean = true
): Promise<PreviewMetadata> => {
  if (!revision || !revision.metadata) {
    throw new Error('getDatasetMetadata requires access to the revision and metadata');
  }

  const { rounding_applied, designation, related_links, providers, metadata } = revision;
  const { summary, quality, collection, rounding_description } = metadata;

  const preview: PreviewMetadata = {
    title: revision.metadata.title,
    keyInfo: {
      updatedAt: revision?.publish_at,
      nextUpdateAt: revision.update_frequency,
      designation,
      providers: providers?.map(({ provider_name, source_name }) => ({ provider_name, source_name })),
      timePeriod: { start: dataset.start_date, end: dataset.end_date }
    },
    notes: {
      roundingApplied: rounding_applied,
      roundingDescription: renderHtml ? await markdownToSafeHTML(rounding_description) : rounding_description || '',
      publishedRevisions: dataset.revisions?.filter((rev) => isPublished(rev))
    },
    about: {
      summary: renderHtml ? await markdownToSafeHTML(summary) : summary || '',
      quality: renderHtml ? await markdownToSafeHTML(quality) : quality || '',
      collection: renderHtml ? await markdownToSafeHTML(collection) : collection || '',
      relatedLinks: related_links
    },
    publisher: dataset.publisher
  };

  return preview;
};

export const metadataToCSV = (metadata: PreviewMetadata, locale: Locale): string[][] => {
  const lines = [];

  lines.push([t('dataset_view.key_information.title'), metadata.title ?? '']);
  lines.push([
    t('dataset_view.key_information.last_update'),
    metadata.keyInfo.updatedAt ? dateFormat(metadata.keyInfo.updatedAt, 'd MMMM yyyy', { locale }) : ''
  ]);

  if (metadata.keyInfo.nextUpdateAt) {
    const { update_type } = metadata.keyInfo.nextUpdateAt;
    const { day, month, year } = metadata.keyInfo.nextUpdateAt.date || {};
    const date = parse(`${day || '01'} ${month} ${year}`, 'dd MM yyyy', new Date());

    switch (update_type) {
      case NextUpdateType.None:
        lines.push([t('dataset_view.key_information.next_update'), t('dataset_view.key_information.next_update_none')]);
        break;
      case NextUpdateType.Replacement:
        lines.push([
          t('dataset_view.key_information.next_update'),
          t('dataset_view.key_information.next_update_replacement')
        ]);
        break;
      case NextUpdateType.Update:
        if (day) {
          lines.push([t('dataset_view.key_information.next_update'), dateFormat(date, 'd MMMM yyyy', { locale })]);
        } else {
          lines.push([t('dataset_view.key_information.next_update'), dateFormat(date, 'MMMM yyyy', { locale })]);
        }
        break;
    }
  }

  lines.push([
    t('dataset_view.about.designation'),
    t(`dataset_view.about.designations.${metadata.keyInfo.designation}`)
  ]);

  lines.push([
    t('dataset_view.key_information.time_covered'),
    t('dataset_view.key_information.time_period', {
      start: metadata.keyInfo.timePeriod.start
        ? dateFormat(metadata.keyInfo.timePeriod.start, 'MMMM yyyy', { locale })
        : '',
      end: metadata.keyInfo.timePeriod.end ? dateFormat(metadata.keyInfo.timePeriod.end, 'MMMM yyyy', { locale }) : ''
    })
  ]);

  metadata.keyInfo.providers?.forEach((provider) => {
    lines.push([t('dataset_view.key_information.data_provider'), provider.provider_name ?? '']);
    lines.push([t('dataset_view.key_information.data_source'), provider.source_name ?? '']);
  });

  if (metadata.notes.publishedRevisions && metadata.notes.publishedRevisions.length > 1) {
    lines.push([
      t('dataset_view.notes.revisions'),
      metadata.notes.publishedRevisions
        .sort((a, b) => ((a.publish_at ?? '') > (b.publish_at ?? '') ? 1 : -1))
        .map((rev) => (rev.publish_at ? dateFormat(rev.publish_at, 'dd MMMM yyyy', { locale }) : ''))
        .join(', ')
    ]);
  }

  lines.push([t('dataset_view.about.summary'), metadata.about.summary!]);
  lines.push([t('dataset_view.about.data_collection'), metadata.about.collection!]);
  lines.push([t('dataset_view.about.summary'), metadata.about.summary ?? '']);
  lines.push([t('dataset_view.about.data_collection'), metadata.about.collection ?? '']);
  lines.push([t('dataset_view.about.statistical_quality'), metadata.about.quality ?? '']);

  if (metadata.notes.roundingApplied) {
    lines.push([t('dataset_view.notes.rounding'), metadata.notes.roundingDescription ?? '']);
  }

  metadata.about.relatedLinks?.forEach((link) => {
    lines.push([
      t('dataset_view.about.related_reports'),
      locale.includes(Locale.English) ? (link.label_en ?? '') : (link.label_cy ?? ''),
      link.url ?? ''
    ]);
  });

  lines.push([t('dataset_view.published.org'), metadata.publisher?.organisation.name ?? '']);
  lines.push([t('dataset_view.published.contact'), metadata.publisher?.group.email ?? '']);

  return lines;
};
