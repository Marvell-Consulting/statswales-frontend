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
  return dataset.first_published_at && isBefore(dataset.first_published_at, new Date())
    ? DatasetStatus.Live
    : DatasetStatus.New;
};

export const getPublishingStatus = (
  dataset: DatasetDTO,
  revision?: RevisionDTO | SingleLanguageRevision
): PublishingStatus => {
  revision = revision ?? getLatestRevision(dataset);
  const datasetStatus = getDatasetStatus(dataset);
  const openTasks = dataset.tasks?.filter((task) => task.open) || [];
  const openPublishTask = openTasks.find((task) => task.action === TaskAction.Publish);
  const openUnpublishTask = openTasks.find((task) => task.action === TaskAction.Unpublish);
  const openArchiveTask = openTasks.find((task) => task.action === TaskAction.Archive);

  if (openPublishTask) {
    if (openPublishTask.status === TaskStatus.Requested) {
      return datasetStatus === DatasetStatus.Live
        ? PublishingStatus.UpdatePendingApproval
        : PublishingStatus.PendingApproval;
    }
    if (openPublishTask.status === TaskStatus.Rejected) return PublishingStatus.ChangesRequested;
  }

  if (openUnpublishTask) {
    return PublishingStatus.UnpublishRequested;
  }

  if (openArchiveTask) {
    return PublishingStatus.ArchiveRequested;
  }

  if (datasetStatus === DatasetStatus.New) {
    return revision?.approved_at ? PublishingStatus.Scheduled : PublishingStatus.Incomplete;
  }

  if (revision?.approved_at && revision.publish_at && isBefore(revision.publish_at, new Date())) {
    return PublishingStatus.Published;
  }

  return revision?.approved_at ? PublishingStatus.UpdateScheduled : PublishingStatus.UpdateIncomplete;
};
