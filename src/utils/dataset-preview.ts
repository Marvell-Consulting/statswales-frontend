import { SingleLanguageDataset } from '../dtos/single-language/dataset';
import { SingleLanguageRevision } from '../dtos/single-language/revision';

import { nextUpdateAt } from './next-update-at';
import { markdownToSafeHTML } from './markdown-to-html';
import { isPublished } from './revision';
import { PreviewMetadata } from '../interfaces/preview-metadata';

export const getDatasetPreview = async (
  dataset: SingleLanguageDataset,
  revision: SingleLanguageRevision
): Promise<PreviewMetadata> => {
  if (!revision || !revision.metadata) {
    throw new Error('preview requires access to the revision and metadata');
  }

  const { rounding_applied, designation, related_links, providers, metadata } = revision;
  const { summary, quality, collection, rounding_description } = metadata;

  const preview: PreviewMetadata = {
    title: revision.metadata.title,
    keyInfo: {
      updatedAt: revision?.publish_at,
      nextUpdateAt: nextUpdateAt(revision),
      designation,
      providers: providers?.map(({ provider_name, source_name }) => ({ provider_name, source_name })),
      timePeriod: { start: dataset.start_date, end: dataset.end_date }
    },
    notes: {
      roundingApplied: rounding_applied,
      roundingDescription: await markdownToSafeHTML(rounding_description),
      publishedRevisions: dataset.revisions?.filter((rev) => isPublished(rev))
    },
    about: {
      summary: await markdownToSafeHTML(summary),
      quality: await markdownToSafeHTML(quality),
      collection: await markdownToSafeHTML(collection),
      relatedLinks: related_links
    },
    published: {
      organisation: undefined
    }
  };

  return preview;
};
