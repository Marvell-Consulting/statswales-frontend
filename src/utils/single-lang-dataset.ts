import { DatasetDTO } from '../dtos/dataset-dto';

export const singleLangDataset = (lang: string, dataset: DatasetDTO) => {
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
