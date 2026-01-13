import { SingleLanguageRevision } from '../dtos/single-language/revision';

export const getDownloadFilename = (datasetId: string, revision: SingleLanguageRevision, lang: string) => {
  const version = revision.revision_index > 0 ? `v${revision.revision_index}` : 'draft';
  return `${revision.metadata?.title ?? datasetId}-${version}-${lang}`;
};
