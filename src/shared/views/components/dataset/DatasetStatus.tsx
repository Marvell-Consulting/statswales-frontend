import { clsx } from 'clsx';
import React from 'react';
import T from '../T';
import { statusToColour } from '../../../utils/status-to-colour';
import { PublishingStatus } from '../../../enums/publishing-status';
import { DatasetStatus as DatasetStatusEnum } from '../../../enums/dataset-status';

export type DatasetStatusProps = {
  publishingStatus: PublishingStatus;
  datasetStatus: DatasetStatusEnum;
};

export default function DatasetStatus({ publishingStatus, datasetStatus }: DatasetStatusProps) {
  return (
    <div className="status-badges govuk-!-margin-bottom-8">
      <strong className={clsx('govuk-tag', 'dataset-status ', `govuk-tag--${statusToColour(datasetStatus)}`)}>
        <T>badge.dataset_status.{datasetStatus}</T>
      </strong>{' '}
      {publishingStatus && (
        <strong className={clsx('govuk-tag', 'publishing-status', `govuk-tag--${statusToColour(publishingStatus)}`)}>
          <T>badge.publishing_status.{publishingStatus}</T>
        </strong>
      )}
    </div>
  );
}
