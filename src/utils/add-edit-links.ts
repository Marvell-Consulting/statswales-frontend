import { Request } from 'express';

import { TranslationDTO } from '../dtos/translations';

export const addEditLinks = (translations: TranslationDTO[], datasetId: string, req: Request) => {
    return translations.map((translation) => {
        if (translation.type === 'dimension') {
            translation.edit_link = req.buildUrl(
                `/publish/${datasetId}/dimension-data-chooser/${translation.id}`,
                req.language
            );
            return translation;
        }

        if (translation.type === 'link') {
            translation.edit_link = req.buildUrl(`/publish/${datasetId}/related`, req.language);
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
