import { SingleLanguageDataset } from '../dtos/single-language/dataset';
import { SingleLanguageRevision } from '../dtos/single-language/revision';

export const getDownloadFilename = (dataset: SingleLanguageDataset, revision: SingleLanguageRevision, lang: string) => {
  const version = revision.revision_index > 0 ? `v${revision.revision_index}` : 'draft';
  return `${revision.metadata?.title ?? dataset.id}-${version}-${lang}`;
};
