import React from 'react';
import T from '../../../shared/views/components/T';
import { statusToColour } from '../../../shared/utils/status-to-colour';
import { TaskListStatus } from '../../../shared/enums/task-list-status';

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
