import { TaskStatus } from '../enums/task-status';

export const statusToColour = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Completed:
        case TaskStatus.Available:
            return 'green';

        case TaskStatus.NotImplemented:
            return 'red';

        case TaskStatus.NotStarted:
        case TaskStatus.Incomplete:
        default:
            return 'grey';
    }
};
