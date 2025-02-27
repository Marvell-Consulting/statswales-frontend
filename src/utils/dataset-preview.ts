import { isBefore } from 'date-fns';

import { SingleLanguageDataset } from '../dtos/single-language/dataset';
import { SingleLanguageRevision } from '../dtos/single-language/revision';

import { nextUpdateAt } from './next-update-at';
import { markdownToSafeHTML } from './markdown-to-html';

export const getDatasetPreview = async (dataset: SingleLanguageDataset, revision: SingleLanguageRevision) => {
    if (!revision || !revision.metadata) {
        throw new Error('preview requires access to the revision and metadata');
    }

    const { summary, quality, collection, rounding_description } = revision.metadata;
    const { rounding_applied, designation, related_links } = revision;

    const preview = {
        keyInfo: {
            updatedAt: revision?.publish_at,
            nextUpdateAt: nextUpdateAt(revision),
            designation,
            providers: revision.providers?.map(({ provider_name, source_name }) => ({ provider_name, source_name })),
            timePeriod: { start: dataset.start_date, end: dataset.end_date }
        },
        notes: {
            roundingApplied: rounding_applied,
            roundingDescription: await markdownToSafeHTML(rounding_description),
            publishedRevisions: dataset.revisions
        },
        about: {
            summary: await markdownToSafeHTML(summary),
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
