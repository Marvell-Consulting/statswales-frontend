import React from 'react';

export default function TasklistStatus({ status, t, statusToColour }) {
  const colour = statusToColour(status);
  return (
    <div className="govuk-task-list__status">
      <strong className={colour ? `govuk-tag govuk-tag--${colour}` : undefined}>
        {t(`publish.tasklist.status.${status}`)}
      </strong>
    </div>
  );
}
