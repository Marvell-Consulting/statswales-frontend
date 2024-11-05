import { TaskStatus } from '../enums/task-status';

export const statusToColour = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Completed:
            return 'green';

        case TaskStatus.NotImplemented:
            return 'red';

        case TaskStatus.NotStarted:
        default:
            return 'grey';
    }
};
