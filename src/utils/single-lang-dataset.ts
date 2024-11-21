import { DatasetDTO } from '../dtos/dataset';
import { SingleLanguageDataset } from '../dtos/single-language/dataset';

export const singleLangDataset = (dataset: DatasetDTO, lang: string): SingleLanguageDataset => {
    return {
        ...dataset,
        datasetInfo: dataset.datasetInfo?.find((info) => info.language === lang),
        dimensions: dataset.dimensions?.map((dimension) => {
            return {
                ...dimension,
                dimensionInfo: dimension.dimensionInfo?.find((info) => info.language === lang)
            };
        }),
        providers: dataset.providers?.filter((provider) => provider.language === lang.toLowerCase())
    };
};
