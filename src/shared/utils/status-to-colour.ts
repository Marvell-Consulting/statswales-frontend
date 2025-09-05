import { DatasetStatus } from '../enums/dataset-status';
import { PublishingStatus } from '../enums/publishing-status';
import { TaskListStatus } from '../enums/task-list-status';
import { UserStatus } from '../enums/user-status';

export const statusToColour = (status: TaskListStatus | DatasetStatus | PublishingStatus | UserStatus): string => {
  switch (status) {
    case DatasetStatus.Migrated:
      return 'yellow';

    case DatasetStatus.New:
    case PublishingStatus.Incomplete:
    case PublishingStatus.UpdateIncomplete:
    case TaskListStatus.Incomplete:
      return 'blue';

    case TaskListStatus.NotStarted:
    case UserStatus.Inactive:
    case PublishingStatus.ChangesRequested:
      return 'red';

    case TaskListStatus.Updated:
    case PublishingStatus.PendingApproval:
    case PublishingStatus.UpdatePendingApproval:
    case PublishingStatus.Scheduled:
    case PublishingStatus.UpdateScheduled:
    case PublishingStatus.UnpublishRequested:
    case PublishingStatus.ArchiveRequested:
      return 'orange';

    case DatasetStatus.Live:
    case PublishingStatus.Published:
    case TaskListStatus.Completed:
    case UserStatus.Active:
      return 'green';

    case TaskListStatus.Unchanged:
      return 'grey';

    default:
      return '';
  }
};
