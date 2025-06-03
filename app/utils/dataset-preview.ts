import type { SingleLanguageDataset } from '../dtos/single-language/dataset';
import type { SingleLanguageRevision } from '../dtos/single-language/revision';

import { nextUpdateAt } from './next-update-at';
import { markdownToSafeHTML } from './markdown-to-html';
import { isPublished } from './revision';
import type { PreviewMetadata } from '../interfaces/preview-metadata';

export const getDatasetPreview = async (
  dataset: SingleLanguageDataset,
  revision: SingleLanguageRevision
): Promise<PreviewMetadata> => {
  if (!revision || !revision.metadata) {
    throw new Error('preview requires access to the revision and metadata');
  }

  const { summary, quality, collection, rounding_description } = revision.metadata;
  const { rounding_applied, designation, related_links } = revision;

  const preview: PreviewMetadata = {
    title: revision.metadata.title,
    keyInfo: {
      updatedAt: revision?.publish_at,
      nextUpdateAt: nextUpdateAt(revision),
      designation,
      providers: revision.providers?.map(({ provider_name, source_name }) => ({
        provider_name,
        source_name
      })),
      timePeriod: { start: dataset.start_date, end: dataset.end_date }
    },
    notes: {
      roundingApplied: rounding_applied,
      // TODO: use markdown to JSX for this.
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
