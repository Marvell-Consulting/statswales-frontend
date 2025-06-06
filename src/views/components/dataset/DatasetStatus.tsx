import clsx from 'clsx';
import React from 'react';
import { useLocals } from '../../context/Locals';
import T from '../T';

export type DatasetStatusProps = {
  publishingStatus: string;
  datasetStatus: string;
};

export default function DatasetStatus({ publishingStatus, datasetStatus }: DatasetStatusProps) {
  const { statusToColour } = useLocals();
  return (
    <div className="govuk-!-margin-bottom-8">
      <strong className={clsx('govuk-tag', `govuk-tag--${statusToColour(datasetStatus)}`)}>
        <T>badge.dataset_status.{datasetStatus}</T>
      </strong>{' '}
      {publishingStatus && (
        <strong className={clsx('govuk-tag', `govuk-tag--${statusToColour(publishingStatus)}`)}>
          <T>badge.publishing_status.{publishingStatus}</T>
        </strong>
      )}
    </div>
  );
}
