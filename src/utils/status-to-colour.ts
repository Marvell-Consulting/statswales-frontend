import { DatasetStatus } from '../enums/dataset-status';
import { PublishingStatus } from '../enums/publishing-status';
import { TaskStatus } from '../enums/task-status';

export const statusToColour = (status: TaskStatus | DatasetStatus | PublishingStatus) => {
    switch (status) {
        case TaskStatus.Completed:
        case TaskStatus.Available:
        case TaskStatus.Updated:
        case DatasetStatus.New:
            return 'green';

        case TaskStatus.Unchanged:
            return 'red';

        case PublishingStatus.Scheduled:
        case PublishingStatus.UpdateScheduled:
            return 'orange';

        case DatasetStatus.Migrated:
            return 'yellow';

        case DatasetStatus.Live:
            return 'blue';

        case PublishingStatus.Published:
            return 'light-blue';

        case TaskStatus.NotStarted:
        case TaskStatus.Incomplete:
        case PublishingStatus.Incomplete:
        case PublishingStatus.UpdateIncomplete:
        default:
            return 'grey';
    }
};
