import React from 'react';
import T from './T';
import { useLocals } from '../context/Locals';

export type TasklistStatusProps = {
  status: string;
};

export default function TasklistStatus({ status }: TasklistStatusProps) {
  const { statusToColour } = useLocals();
  const colour = statusToColour(status);
  return (
    <div className="govuk-task-list__status">
      <strong className={colour ? `govuk-tag govuk-tag--${colour}` : undefined}>
        <T>publish.tasklist.status.{status}</T>
      </strong>
    </div>
  );
}
