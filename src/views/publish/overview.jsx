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

function Actions({ datasetId, canEdit, canMoveGroup, datasetStatus, publishingStatus }) {
  return (
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
        ['pending_approval', 'update_pending_approval', 'scheduled', 'update_scheduled'].includes(publishingStatus) && (
          <li>
            <ActionLink
              path={`/publish/${datasetId}/overview`}
              action={
                publishingStatus === 'update_scheduled'
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
  );
}

function History({ history }) {
  const { dateFormat, i18n } = useLocals();

  const columns = [
    {
      key: 'created_at',
      label: <T>publish.overview.history.table.created_at</T>,
      format: (value) => dateFormat(value, 'h:mmaaa, d MMMM yyyy', { locale: i18n.language })
    },
    {
      key: 'action',
      label: <T>publish.overview.history.table.action</T>
    },
    {
      key: 'user_id',
      label: <T>publish.overview.history.table.user</T>
    }
  ];

  return (
    <Table columns={columns} rows={history} />
  );
}

export default function Overview(props) {
  const datasetId = props.dataset.id;

  return (
    <Layout {...props}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <FlashMessages {...props} />

          <span className="region-subhead">{props.t('publish.overview.subheading')}</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{props.title}</h1>

          <DatasetStatus {...props} />
          <ErrorHandler {...props} />

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

                {props.canApprove && (
                  <a
                    className="govuk-button govuk-!-margin-top-4"
                    href={props.buildUrl(
                      `/publish/${datasetId}/task-decision/${props.openPublishTask?.id}`,
                      props.i18n.language
                    )}
                  >
                    {props.t('publish.overview.buttons.pending_approval')}
                  </a>
                )}
              </>
            )}

            {props.openPublishTask?.status === 'rejected' && props.canEdit && (
              <>
                <p className="govuk-body">{props.t('publish.overview.rejected.summary')}</p>
                <p className="govuk-body">{props.openPublishTask?.comment}</p>
                <a
                  className="govuk-button govuk-!-margin-top-4"
                  href={props.buildUrl(`/publish/${datasetId}/tasklist`, props.i18n.language)}
                >
                  {props.t('publish.overview.buttons.fix')}
                </a>
              </>
            )}

            {props.publishingStatus === 'scheduled' && (
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
                label: props.t('publish.overview.tabs.actions'),
                children: <Actions {...props} />
              },
              {
                id: 'history',
                label: props.t('publish.overview.tabs.history'),
                children: <History {...props} />
              }
            ]}
          />
        </div>
      </div>
    </Layout>
  );
}
