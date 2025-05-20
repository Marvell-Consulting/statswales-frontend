import clsx from 'clsx';
import React from 'react';

export default function DatasetStatus({ statusToColour, t, publishingStatus, datasetStatus }) {
  return (
    <div className="govuk-!-margin-bottom-8">
      <strong className={clsx('govuk-tag', `govuk-tag--${statusToColour(datasetStatus)}`)}>
        {t(`badge.dataset_status.${datasetStatus}`)}
      </strong>{' '}
      {publishingStatus && (
        <strong className={clsx('govuk-tag', `govuk-tag--${statusToColour(publishingStatus)}`)}>
          {t(`badge.publishing_status.${publishingStatus}`)}
        </strong>
      )}
    </div>
  );
}
