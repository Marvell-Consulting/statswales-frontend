import React from 'react';

import { useLocals } from '../context/Locals';
import Layout from '../components/layouts/Publisher';
import FlashMessages from '../components/FlashMessages';
import ErrorHandler from '../components/ErrorHandler';
import DatasetStatus from '../components/dataset/DatasetStatus';
import Tabs from '../components/Tabs';
import T from '../components/T';
import Table from '../components/Table';

function ActionLink({ path, action, newTab, queryParams }) {
  const { buildUrl, i18n } = useLocals();

  return (
    <a
      className="govuk-link govuk-link--no-underline"
      href={buildUrl(path, i18n.language, queryParams)}
      target={newTab ? '_blank' : undefined}
    >
      <T>publish.overview.actions.{action}</T>
    </a>
  );
}

function ActionsTab({
  datasetId,
  canEdit,
  canApprove,
  canMoveGroup,
  datasetStatus,
  publishingStatus,
  openPublishTask
}) {
  const { buildUrl, i18n } = useLocals();

  return (
    <>
      <div className="task-decision-buttons">
        {canApprove && ['pending_approval', 'update_pending_approval'].includes(publishingStatus) && (
          <a
            className="govuk-button govuk-!-margin-top-4"
            href={buildUrl(`/publish/${datasetId}/task-decision/${openPublishTask?.id}`, i18n.language)}
          >
            <T>publish.overview.buttons.pending_approval</T>
          </a>
        )}

        {canEdit && openPublishTask?.status === 'rejected' && (
          <>
            <p className="govuk-body">
              <T>publish.overview.rejected.summary</T>
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
      </div>

      <ul className="govuk-list">
        {canEdit && publishingStatus === 'incomplete' && (
          <li>
            <ActionLink path={`/publish/${datasetId}/tasklist`} action="continue" />
          </li>
        )}

        {canEdit && publishingStatus === 'update_incomplete' && (
          <li>
            <ActionLink path={`/publish/${datasetId}/tasklist`} action="continue_update" />
          </li>
        )}

        {datasetStatus === 'live' && (
          <li>
            <ActionLink path={`/published/${datasetId}`} action="view_published_dataset" newTab />
          </li>
        )}

        {canEdit && publishingStatus === 'published' && (
          <li>
            <ActionLink path={`/publish/${datasetId}/update`} action="update_dataset" />
          </li>
        )}

        {publishingStatus !== 'published' && (
          <li>
            <ActionLink path={`/publish/${datasetId}/cube-preview`} action="preview" />
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
            <ActionLink path="move" action="move" />
          </li>
        )}
      </ul>
    </>
  );
}

function HistoryTab({ history }) {
  const { dateFormat, i18n } = useLocals();

  const columns = [
    {
      key: 'created_at',
      label: <T>publish.overview.history.table.created_at</T>,
      format: (createdAt, event) => {
        return (
          <span data-eventid={event.id}>
            {dateFormat(createdAt, 'h:mmaaa, d MMMM yyyy', { locale: i18n.language })}
          </span>
        );
      }
    },
    {
      key: 'action',
      label: <T>publish.overview.history.table.action</T>,
      format: (action, event) => {
        if (event.entity === 'dataset') {
          return <T>publish.overview.history.event.dataset.{action}</T>;
        }

        if (event.entity === 'revision') {
          return <T>publish.overview.history.event.revision.{action}</T>;
        }

        if (event.entity === 'task') {
          const { action, status, isUpdate } = event.data;

          if (action === 'publish') {
            return <T>publish.overview.history.event.task.publish.{isUpdate ? `update_${status}` : status}</T>;
          }
        }
      }
    },
    {
      key: 'created_by',
      label: <T>publish.overview.history.table.user</T>,
      format: (createdBy) => {
        return createdBy === 'system' ? <T>publish.overview.history.event.created_by.system</T> : createdBy;
      }
    },
    {
      key: 'comment',
      label: <T>publish.overview.history.table.comment</T>,
      format: (value, row) => {
        if (row.entity === 'task') {
          return row.data?.comment;
        }
      }
    }
  ];

  return <Table columns={columns} rows={history} />;
}

export default function Overview(props) {
  const datasetId = props.dataset.id;

  return (
    <Layout {...props}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <FlashMessages />

          <span className="region-subhead">{props.t('publish.overview.subheading')}</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{props.title}</h1>

          <DatasetStatus {...props} />
          <ErrorHandler />

          <div className="overview-details">
            {['pending_approval', 'update_pending_approval'].includes(props.publishingStatus) && (
              <>
                <p
                  className="govuk-body govuk-!-margin-0"
                  dangerouslySetInnerHTML={{
                    __html: props.t('publish.overview.pending.publish_at', {
                      publishAt: props.dateFormat(props.revision?.publish_at, 'h:mmaaa, d MMMM yyyy')
                    })
                  }}
                />
                <p
                  className="govuk-body govuk-!-margin-0"
                  dangerouslySetInnerHTML={{
                    __html: props.t('publish.overview.pending.requested_by', {
                      userName: props.openPublishTask?.created_by_name
                    })
                  }}
                />
              </>
            )}

            {['scheduled', 'update_scheduled'].includes(props.publishingStatus) && (
              <p
                className="govuk-body"
                dangerouslySetInnerHTML={{
                  __html: props.t('publish.overview.scheduled.publish_at', {
                    publishAt: props.dateFormat(props.revision?.publish_at, 'h:mmaaa, d MMMM yyyy')
                  })
                }}
              ></p>
            )}
          </div>

          <Tabs
            tabs={[
              {
                id: 'actions',
                label: <T>publish.overview.tabs.actions</T>,
                children: <ActionsTab {...props} />
              },
              {
                id: 'history',
                label: <T>publish.overview.tabs.history</T>,
                children: <HistoryTab {...props} />
              }
            ]}
          />
        </div>
      </div>
    </Layout>
  );
}
