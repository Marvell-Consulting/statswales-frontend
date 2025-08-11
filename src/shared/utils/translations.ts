import { Readable } from 'node:stream';

import { Request } from 'express';
import { parse } from 'csv-parse';

import { TranslationDTO } from '../dtos/translations';
import { markdownToSafeHTML } from './markdown-to-html';

export const addEditLinks = (translations: TranslationDTO[], datasetId: string, req: Request) => {
  return translations.map((translation) => {
    if (translation.type === 'dimension') {
      translation.edit_link = req.buildUrl(
        `/publish/${datasetId}/dimension/${translation.id}/change-name`,
        req.language
      );
      return translation;
    }

    if (translation.type === 'link') {
      translation.edit_link = req.buildUrl(`/publish/${datasetId}/related?edit=${translation.key}`, req.language);
      return translation;
    }

    switch (translation.key) {
      case 'description':
        translation.edit_link = req.buildUrl(`/publish/${datasetId}/summary`, req.language);
        break;
      case 'roundingDescription':
        translation.edit_link = req.buildUrl(`/publish/${datasetId}/quality`, req.language);
        break;
      default:
        translation.edit_link = req.buildUrl(`/publish/${datasetId}/${translation.key}`, req.language);
        break;
    }
    return translation;
  });
};

export const parseUploadedTranslations = async (fileBuffer: Buffer): Promise<TranslationDTO[]> => {
  const translations: TranslationDTO[] = [];

  const csvParser: AsyncIterable<TranslationDTO> = Readable.from(fileBuffer).pipe(
    parse({ bom: true, columns: true, skip_records_with_empty_values: true })
  );

  for await (const row of csvParser) {
    translations.push(row);
  }

  return translations;
};

export const markdownToHtml = async (translations: TranslationDTO[]): Promise<TranslationDTO[]> => {
  return Promise.all(
    translations.map(async (translation: TranslationDTO) => {
      if (translation.type === 'metadata') {
        translation.english = await markdownToSafeHTML(translation.english);
        translation.cymraeg = await markdownToSafeHTML(translation.cymraeg);
      }
      return translation;
    })
  );
};
