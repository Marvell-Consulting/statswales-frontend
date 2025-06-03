import type { TaskListStatus } from '~/enums/task-list-status';
import T from './T';
import { statusToColour } from '~/utils/status-to-colour';

export type TasklistStatusProps = {
  status: TaskListStatus;
};

export default function TasklistStatus({ status }: TasklistStatusProps) {
  const colour = statusToColour(status);
  return (
    <div className="govuk-task-list__status">
      <strong className={colour ? `govuk-tag govuk-tag--${colour}` : undefined}>
        <T>publish.tasklist.status.{status}</T>
      </strong>
    </div>
  );
}
