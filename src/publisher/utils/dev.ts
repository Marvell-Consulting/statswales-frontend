import { t } from 'i18next';
import hljs from 'highlight.js';

import { DatasetDTO } from '../../shared/dtos/dataset';
import { FileImportDto } from '../../shared/dtos/file-import';
import { SingleLanguageDataset } from '../../shared/dtos/single-language/dataset';
import { localeUrl } from '../../shared/middleware/language-switcher';

export const processFileList = (datasetId: string, files: FileImportDto[], lang: string): FileImportDto[][] => {
  const processed: FileImportDto[][] = [];

  files = files.sort((fileA, fileB) => fileA.filename.localeCompare(fileB.filename));

  files.unshift({
    filename: t('developer.display.all_files', { lng: lang }),
    mime_type: 'application/zip',
    file_type: 'zip',
    type: 'all',
    hash: '',
    parent_id: datasetId
  });

  files.forEach((file: FileImportDto, index: number) => {
    switch (file.type) {
      case 'data_table':
        file.link = localeUrl(`/developer/${datasetId}/revision/${file.parent_id}/datatable`, lang);
        break;
      case 'dimension':
        file.link = localeUrl(`/developer/${datasetId}/dimension/${file.parent_id}/lookup`, lang);
        break;
      case 'measure':
        file.link = localeUrl(`/developer/${datasetId}/measure/lookup`, lang);
        break;
      case 'all':
        file.link = localeUrl(`/developer/${datasetId}/download`, lang);
        break;
    }
    if (index % 4 === 0) {
      processed.push([file]);
    } else {
      processed[processed.length - 1].push(file);
    }
  });

  return processed;
};

export const getDatasetJson = (dataset: DatasetDTO | SingleLanguageDataset): string => {
  return hljs.highlight(JSON.stringify(dataset, null, 2), {
    language: 'json',
    ignoreIllegals: true
  }).value;
};
