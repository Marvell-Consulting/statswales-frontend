import clsx from 'clsx';
import T from '../T';
import type { PublishingStatus } from '~/enums/publishing-status';
import type { DatasetStatus as Status } from '~/enums/dataset-status';
import { statusToColour } from '~/utils/status-to-colour';

export type DatasetStatusProps = {
  publishingStatus?: PublishingStatus;
  datasetStatus: Status;
};

export default function DatasetStatus({ publishingStatus, datasetStatus }: DatasetStatusProps) {
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
