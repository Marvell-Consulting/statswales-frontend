import { DatasetStatus } from '../enums/dataset-status';
import { PublishingStatus } from '../enums/publishing-status';
import { TaskStatus } from '../enums/task-status';

export const statusToColour = (status: TaskStatus | DatasetStatus | PublishingStatus): string => {
  switch (status) {
    case DatasetStatus.Migrated:
      return 'yellow';

    case DatasetStatus.New:
    case PublishingStatus.Incomplete:
    case PublishingStatus.UpdateIncomplete:
    case TaskStatus.Incomplete:
      return 'blue';

    case TaskStatus.NotStarted:
      return 'red';

    case TaskStatus.Updated:
    case PublishingStatus.Scheduled:
    case PublishingStatus.UpdateScheduled:
      return 'orange';

    case DatasetStatus.Live:
    case PublishingStatus.Published:
    case TaskStatus.Completed:
      return 'green';

    case TaskStatus.Unchanged:
      return 'grey';

    default:
      return '';
  }
};
