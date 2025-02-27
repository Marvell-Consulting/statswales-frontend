import { isBefore } from 'date-fns';

import { DatasetDTO } from '../dtos/dataset';
import { DatasetStatus } from '../enums/dataset-status';
import { PublishingStatus } from '../enums/publishing-status';

import { getLatestRevision } from './revision';

export const getDatasetStatus = (dataset: DatasetDTO): DatasetStatus => {
    return dataset.live && isBefore(dataset.live, new Date()) ? DatasetStatus.Live : DatasetStatus.New;
};

export const getPublishingStatus = (dataset: DatasetDTO): PublishingStatus => {
    const revision = getLatestRevision(dataset);

    if (getDatasetStatus(dataset) === DatasetStatus.New) {
        return revision?.approved_at ? PublishingStatus.Scheduled : PublishingStatus.Incomplete;
    }

    if (revision?.approved_at && revision.publish_at && isBefore(revision.publish_at, new Date())) {
        return PublishingStatus.Published;
    }

    return revision?.approved_at ? PublishingStatus.UpdateScheduled : PublishingStatus.UpdateIncomplete;
};
