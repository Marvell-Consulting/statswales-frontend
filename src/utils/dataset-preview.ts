import { RevisionDTO } from '../dtos/revision';
import { SingleLanguageDataset } from '../dtos/single-language/dataset';

import { nextUpdateAt } from './next-update-at';
import { markdownToSafeHTML } from './markdown-to-html';
import { createdAtDesc, isPublished } from './revision';

// TODO: once we move metadata to the revision, we should not need the dataset param
export const getDatasetPreview = async (dataset: SingleLanguageDataset, revision: RevisionDTO) => {
    if (!revision || !dataset.datasetInfo) {
        throw new Error('preview requires access to the revision and metadata');
    }

    const { description, quality, collection, designation } = dataset.datasetInfo;
    const { rounding_applied, rounding_description, related_links } = dataset.datasetInfo;

    const preview = {
        keyInfo: {
            updatedAt: revision?.publish_at,
            nextUpdateAt: nextUpdateAt(revision, dataset.datasetInfo!),
            designation,
            providers: dataset.providers?.map(({ provider_name, source_name }) => ({ provider_name, source_name })),
            timePeriod: { start: dataset.start_date, end: dataset.end_date }
        },
        notes: {
            roundingApplied: rounding_applied,
            roundingDescription: await markdownToSafeHTML(rounding_description),
            publishedRevisions: dataset.revisions.filter(isPublished).sort(createdAtDesc)
        },
        about: {
            summary: await markdownToSafeHTML(description),
            quality: await markdownToSafeHTML(quality),
            collection: await markdownToSafeHTML(collection),
            relatedLinks: related_links
        },
        published: {
            team: dataset.team
        }
    };

    return preview;
};
