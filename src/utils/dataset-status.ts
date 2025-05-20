import { isBefore } from 'date-fns';

import { DatasetDTO } from '../dtos/dataset';
import { DatasetStatus } from '../enums/dataset-status';
import { PublishingStatus } from '../enums/publishing-status';

import { getLatestRevision } from './revision';
import { RevisionDTO } from '../dtos/revision';
import { SingleLanguageRevision } from '../dtos/single-language/revision';
import { TaskAction } from '../enums/task-action';
import { TaskStatus } from '../enums/task-status';

export const getDatasetStatus = (dataset: DatasetDTO): DatasetStatus => {
  return dataset.live && isBefore(dataset.live, new Date()) ? DatasetStatus.Live : DatasetStatus.New;
};

export const getPublishingStatus = (
  dataset: DatasetDTO,
  revision?: RevisionDTO | SingleLanguageRevision
): PublishingStatus => {
  revision = revision ?? getLatestRevision(dataset);
  const datasetStatus = getDatasetStatus(dataset);
  const openPublishingTask = dataset.tasks?.find((task) => task.open && task.action === TaskAction.Publish);

  if (openPublishingTask) {
    if (openPublishingTask.status === TaskStatus.Requested) return PublishingStatus.PendingApproval;
    if (openPublishingTask.status === TaskStatus.Rejected) return PublishingStatus.ChangesRequested;
  }

  if (datasetStatus === DatasetStatus.New) {
    return revision?.approved_at ? PublishingStatus.Scheduled : PublishingStatus.Incomplete;
  }

  if (revision?.approved_at && revision.publish_at && isBefore(revision.publish_at, new Date())) {
    return PublishingStatus.Published;
  }

  return revision?.approved_at ? PublishingStatus.UpdateScheduled : PublishingStatus.UpdateIncomplete;
};
