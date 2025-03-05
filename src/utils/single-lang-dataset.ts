import { DatasetDTO } from '../dtos/dataset';
import { RevisionDTO } from '../dtos/revision';
import { SingleLanguageDataset } from '../dtos/single-language/dataset';
import { SingleLanguageRevision } from '../dtos/single-language/revision';
import { Locale } from '../enums/locale';

export const singleLangRevision = (revision?: RevisionDTO, lang?: string): SingleLanguageRevision | undefined => {
    if (!revision || !lang) return undefined;

    return {
        ...revision,
        metadata: revision.metadata?.find((meta) => meta.language === lang),
        providers: (revision.providers || []).filter((provider) => provider.language === lang?.toLowerCase()),
        related_links: revision.related_links?.map((link) => ({
            ...link,
            label: lang.includes(Locale.English) ? link.label_en : link.label_cy
        }))
    };
};

export const singleLangDataset = (dataset: DatasetDTO, lang: string): SingleLanguageDataset => {
    return {
        ...dataset,
        start_revision: singleLangRevision(dataset.start_revision, lang),
        end_revision: singleLangRevision(dataset.end_revision, lang),
        draft_revision: singleLangRevision(dataset.draft_revision, lang),
        published_revision: singleLangRevision(dataset.published_revision, lang),
        revisions: dataset.revisions?.map((rev) => singleLangRevision(rev, lang)!),
        team: dataset.team?.find((team) => team.language === lang),
        dimensions: dataset.dimensions?.map((dimension) => {
            return {
                ...dimension,
                metadata: dimension.metadata?.find((meta) => meta.language === lang)
            };
        })
    };
};
