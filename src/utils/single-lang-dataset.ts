import { DatasetDTO } from '../dtos2/dataset-dto';
import { SingleLanguageDataset } from '../dtos2/single-language/dataset';

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
