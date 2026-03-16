import { t } from 'i18next';
import { ConsumerDatasetDTO } from '../dtos/consumer-dataset';
import { DatasetDTO } from '../dtos/dataset';
import { RevisionDTO } from '../dtos/revision';
import { RevisionMetadataDTO } from '../dtos/revision-metadata';
import { SingleLanguageDataset } from '../dtos/single-language/dataset';
import { SingleLanguageRevision } from '../dtos/single-language/revision';
import { Locale } from '../enums/locale';

const getTitle = (metadata: RevisionMetadataDTO[], lang: string): string => {
  const metaEN = metadata.find((m) => m.language === Locale.EnglishGb);
  const metaCY = metadata.find((m) => m.language === Locale.WelshGb);

  if (lang.includes(Locale.English)) {
    return metaEN?.title ? metaEN.title : `${metaCY?.title} [${t('homepage.table.not_translated', { lng: lang })}]`;
  }
  return metaCY?.title ? metaCY.title : `${metaEN?.title} [${t('homepage.table.not_translated', { lng: lang })}]`;
};

export const singleLangRevision = (revision?: RevisionDTO, lang?: string): SingleLanguageRevision | undefined => {
  if (!revision || !lang) return undefined;

  return {
    ...revision,
    metadata: revision.metadata
      ? {
          ...revision.metadata?.find((meta) => meta.language === lang),
          title: getTitle(revision.metadata, lang)
        }
      : {},
    providers: (revision.providers || []).filter((provider) => provider.language === lang?.toLowerCase()),
    related_links: revision.related_links?.map((link) => ({
      ...link,
      label: lang.includes(Locale.English) ? link.label_en : link.label_cy
    }))
  };
};

export const singleLangDataset = (dataset: DatasetDTO | ConsumerDatasetDTO, lang: string): SingleLanguageDataset => {
  const pub = 'start_revision' in dataset ? (dataset as DatasetDTO) : undefined;

  return {
    ...dataset,
    start_revision: singleLangRevision(pub?.start_revision, lang),
    end_revision: singleLangRevision(pub?.end_revision, lang),
    draft_revision: singleLangRevision(pub?.draft_revision, lang),
    published_revision: singleLangRevision(dataset.published_revision, lang),
    revisions: dataset.revisions?.map((rev) => singleLangRevision(rev, lang)).filter((rev) => rev !== undefined),
    dimensions: dataset.dimensions?.map((dimension) => {
      return {
        ...dimension,
        metadata: dimension.metadata?.find((meta) => meta.language === lang)
      };
    }),
    measure: pub?.measure
      ? {
          ...pub.measure,
          metadata: pub.measure.metadata?.find((meta) => meta.language === lang),
          measure_table: pub.measure.measure_table?.filter((row) => row.language === lang.toLowerCase())
        }
      : undefined
  };
};
