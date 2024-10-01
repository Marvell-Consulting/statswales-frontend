import { DatasetDTO } from '../dtos/dataset-dto';
import { SingleLanguageDataset } from '../dtos/single-language/dataset';

export const singleLangDataset = (lang: string, dataset: DatasetDTO): SingleLanguageDataset => {
    return {
        ...dataset,
        datasetInfo: dataset.datasetInfo?.find((info) => info.language === lang),
        dimensions: dataset.dimensions?.map((dimension) => {
            return {
                ...dimension,
                dimensionInfo: dimension.dimensionInfo?.find((info) => info.language === lang)
            };
        })
    };
};
