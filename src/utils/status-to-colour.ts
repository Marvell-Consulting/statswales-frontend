import { DatasetStatus } from '../enums/dataset-status';
import { PublishingStatus } from '../enums/publishing-status';
import { TaskStatus } from '../enums/task-status';
import { UserStatus } from '../enums/user-status';

export const statusToColour = (status: TaskStatus | DatasetStatus | PublishingStatus | UserStatus): string => {
  switch (status) {
    case DatasetStatus.Migrated:
      return 'yellow';

    case DatasetStatus.New:
    case PublishingStatus.Incomplete:
    case PublishingStatus.UpdateIncomplete:
    case TaskStatus.Incomplete:
      return 'blue';

    case TaskStatus.NotStarted:
    case UserStatus.Inactive:
      return 'red';

    case TaskStatus.Updated:
    case PublishingStatus.Scheduled:
    case PublishingStatus.UpdateScheduled:
      return 'orange';

    case DatasetStatus.Live:
    case PublishingStatus.Published:
    case TaskStatus.Completed:
    case UserStatus.Active:
      return 'green';

    case TaskStatus.Unchanged:
      return 'grey';

    default:
      return '';
  }
};
