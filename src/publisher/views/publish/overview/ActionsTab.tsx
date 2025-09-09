import React from 'react';

import { TaskDTO } from '../../../../shared/dtos/task';
import T from '../../../../shared/views/components/T';
import { useLocals } from '../../../../shared/views/context/Locals';
import { appConfig } from '../../../../shared/config';
import { TaskAction } from '../../../../shared/enums/task-action';
import { TaskStatus } from '../../../../shared/enums/task-status';
import { DatasetStatus } from '../../../../shared/enums/dataset-status';
import { PublishingStatus } from '../../../../shared/enums/publishing-status';

const config = appConfig();

type ActionLinkProps = {
  path?: string;
  fullUrl?: string;
  action: string;
  newTab?: boolean;
  queryParams?: Record<string, string>;
};

function ActionLink({ path, fullUrl, action, newTab, queryParams }: ActionLinkProps) {
  const { buildUrl, i18n } = useLocals();

  return (
    <a
      className="govuk-link govuk-link--no-underline"
      href={path ? buildUrl(path, i18n.language, queryParams) : fullUrl}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noreferrer' : undefined}
    >
      <T>publish.overview.actions.{action}</T>
    </a>
  );
}

type ActionsTabProps = {
  datasetId: string;
  canEdit: boolean;
  canApprove: boolean;
  canMoveGroup: boolean;
  datasetStatus: DatasetStatus;
  publishingStatus: PublishingStatus;
  openTasks: TaskDTO[];
};

export function ActionsTab({
  datasetId,
  canEdit,
  canApprove,
  canMoveGroup,
  datasetStatus,
  publishingStatus,
  openTasks
}: ActionsTabProps) {
  const { buildUrl, i18n } = useLocals();
  const consumerUrl = config.frontend.consumer.url;
  const openPublishTask = openTasks.find((task: TaskDTO) => task.action === TaskAction.Publish);
  const openUnpublishTask = openTasks.find((task: TaskDTO) => task.action === TaskAction.Unpublish);
  const openArchiveTask = openTasks.find((task: TaskDTO) => task.action === TaskAction.Archive);
  const openUnarchiveTask = openTasks.find((task: TaskDTO) => task.action === TaskAction.Unarchive);

  return (
    <>
      <div className="task-decision-buttons">
        {canApprove && openPublishTask?.status === TaskStatus.Requested && (
          <a
            className="govuk-button govuk-!-margin-top-4"
            href={buildUrl(`/publish/${datasetId}/task-decision/${openPublishTask?.id}`, i18n.language)}
          >
            <T>publish.overview.buttons.respond_publish_request</T>
          </a>
        )}

        {canEdit && openPublishTask?.status === TaskStatus.Rejected && (
          <>
            <p className="govuk-body">
              <T>publish.overview.publish.rejected.summary</T>
            </p>
            <p className="govuk-body">{openPublishTask?.comment}</p>
            <a
              className="govuk-button govuk-!-margin-top-4"
              href={buildUrl(`/publish/${datasetId}/tasklist`, i18n.language)}
            >
              <T>publish.overview.buttons.fix</T>
            </a>
          </>
        )}

        {canApprove && openUnpublishTask && (
          <>
            <p className="govuk-body">
              <T>publish.overview.unpublish.requested.summary</T>
            </p>
            <p className="govuk-body">{openUnpublishTask?.comment}</p>
            <a
              className="govuk-button govuk-!-margin-top-4"
              href={buildUrl(`/publish/${datasetId}/task-decision/${openUnpublishTask?.id}`, i18n.language)}
            >
              <T>publish.overview.buttons.respond_unpublish_request</T>
            </a>
          </>
        )}

        {canApprove && openArchiveTask && (
          <>
            <p className="govuk-body">
              <T>publish.overview.archive.requested.summary</T>
            </p>
            <p className="govuk-body">{openArchiveTask?.comment}</p>
            <a
              className="govuk-button govuk-!-margin-top-4"
              href={buildUrl(`/publish/${datasetId}/task-decision/${openArchiveTask?.id}`, i18n.language)}
            >
              <T>publish.overview.buttons.respond_archive_request</T>
            </a>
          </>
        )}

        {canApprove && openUnarchiveTask && (
          <a
            className="govuk-button govuk-!-margin-top-4"
            href={buildUrl(`/publish/${datasetId}/task-decision/${openUnarchiveTask?.id}`, i18n.language)}
          >
            <T>publish.overview.buttons.respond_unarchive_request</T>
          </a>
        )}
      </div>

      <ul className="govuk-list">
        {canEdit && publishingStatus === PublishingStatus.Incomplete && (
          <li>
            <ActionLink path={`/publish/${datasetId}/tasklist`} action="continue" />
          </li>
        )}

        {canEdit && publishingStatus === 'update_incomplete' && (
          <li>
            <ActionLink path={`/publish/${datasetId}/tasklist`} action="continue_update" />
          </li>
        )}

        {[DatasetStatus.Live, DatasetStatus.Archived].includes(datasetStatus) && (
          <li>
            <ActionLink
              fullUrl={`${consumerUrl}/${i18n.language}/${datasetId}`}
              action="view_published_dataset"
              newTab
            />
          </li>
        )}

        {canEdit &&
          datasetStatus === DatasetStatus.Live &&
          publishingStatus === PublishingStatus.Published &&
          openTasks.length === 0 && (
            <li>
              <ActionLink path={`/publish/${datasetId}/update`} action="update_dataset" />
            </li>
          )}

        {(canEdit || canApprove) &&
          datasetStatus === DatasetStatus.Live &&
          publishingStatus === PublishingStatus.Published &&
          openTasks.length === 0 && (
            <>
              <li>
                <ActionLink path={`/publish/${datasetId}/unpublish`} action="unpublish_dataset" />
              </li>
              <li>
                <ActionLink path={`/publish/${datasetId}/archive`} action="archive_dataset" />
              </li>
            </>
          )}

        {(canEdit || canApprove) &&
          datasetStatus === DatasetStatus.Archived &&
          publishingStatus === PublishingStatus.Published &&
          openTasks.length === 0 && (
            <>
              <li>
                <ActionLink path={`/publish/${datasetId}/unarchive`} action="unarchive_dataset" />
              </li>
            </>
          )}

        {publishingStatus !== PublishingStatus.Published && (
          <li>
            <ActionLink path={`/publish/${datasetId}/cube-preview`} action="preview" newTab />
          </li>
        )}

        {canEdit &&
          ['pending_approval', 'update_pending_approval', 'scheduled', 'update_scheduled'].includes(
            publishingStatus
          ) && (
            <li>
              <ActionLink
                path={`/publish/${datasetId}/overview`}
                action={
                  ['update_scheduled', 'update_pending_approval'].includes(publishingStatus)
                    ? 'withdraw_update_revision'
                    : 'withdraw_first_revision'
                }
                queryParams={{ withdraw: 'true' }}
              />
            </li>
          )}

        {canMoveGroup && (
          <li>
            <ActionLink path={`/publish/${datasetId}/move`} action="move" />
          </li>
        )}
      </ul>
    </>
  );
}
