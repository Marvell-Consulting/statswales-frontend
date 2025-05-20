import React from 'react';
import Layout from '../components/layouts/Publisher';
import FlashMessages from '../components/FlashMessages';
import DatasetStatus from '../components/dataset/DatasetStatus';
import ErrorHandler from '../components/ErrorHandler';

export default function Overview(props) {
  function DatasetLink({ path, action, queryParams = {}, newTab }) {
    return (
      <a
        className="govuk-link govuk-link--no-underline"
        href={props.buildUrl(path, props.i18n.language, queryParams)}
        target={newTab ? '_blank' : undefined}
      >
        {props.t(`publish.overview.actions.${action}`)}
      </a>
    );
  }

  const datasetId = props.dataset.id;

  return (
    <Layout {...props}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <FlashMessages {...props} />

          {props.successfullySubmitted && (
            <div
              className="govuk-notification-banner govuk-notification-banner--success"
              role="alert"
              aria-labelledby="govuk-notification-banner-title"
              data-module="govuk-notification-banner"
            >
              <div className="govuk-notification-banner__content">
                <p className="govuk-notification-banner__heading">
                  {props.t('publish.overview.scheduled.notification.content')}
                </p>
              </div>
            </div>
          )}

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
                ></p>
                <p
                  className="govuk-body govuk-!-margin-0"
                  dangerouslySetInnerHTML={{
                    __html: props.t('publish.overview.pending.requested_by', {
                      userName: props.openPublishTask?.created_by_name
                    })
                  }}
                ></p>
              </>
            )}

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
              <p className="govuk-body">
                {props.t('publish.overview.scheduled.publish_at', {
                  publishAt: props.dateFormat(props.revision?.publish_at, 'h:mmaaa, d MMMM yyyy')
                })}
              </p>
            )}
          </div>

          <div className="govuk-tabs" data-module="govuk-tabs">
            <div className="tabs">
              <div className="govuk-width-container">
                <ul className="govuk-tabs__list">
                  <li className="govuk-tabs__list-item">
                    <a
                      className="govuk-tabs__tab"
                      href="#actions"
                      id="tab_actions"
                      role="tab"
                      aria-controls="actions"
                      aria-selected="true"
                      tabIndex="0"
                    >
                      {props.t('publish.overview.tabs.actions')}
                    </a>
                  </li>
                  <li className="govuk-tabs__list-item">
                    <a
                      className="govuk-tabs__tab"
                      href="#history"
                      id="tab_history"
                      role="tab"
                      aria-controls="history"
                      aria-selected="false"
                      tabIndex="-1"
                    >
                      {props.t('publish.overview.tabs.history')}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="govuk-tabs__panel" id="actions" role="tabpanel" aria-labelledby="tab_actions">
              <ul className="govuk-list">
                {props.canEdit && props.publishingStatus === 'incomplete' && (
                  <li>
                    <DatasetLink path={`/publish/${datasetId}/tasklist`} action="continue" />
                  </li>
                )}

                {props.canEdit && props.publishingStatus === 'update_incomplete' && (
                  <li>
                    <DatasetLink path={`/publish/${datasetId}/tasklist`} action="continue_update" />
                  </li>
                )}

                {props.datasetStatus === 'live' && (
                  <li>
                    <DatasetLink path={`/published/${datasetId}`} action="view_published_dataset" newTab />
                  </li>
                )}

                {props.canEdit && props.publishingStatus === 'published' && (
                  <li>
                    <DatasetLink path={`/publish/${datasetId}/update`} action="update_dataset" />
                  </li>
                )}

                {props.publishingStatus !== 'published' && (
                  <li>
                    <DatasetLink path={`/publish/${datasetId}/cube-preview`} action="preview" />
                  </li>
                )}

                {props.canEdit &&
                  ['pending_approval', 'scheduled', 'update_scheduled'].includes(props.publishingStatus) && (
                    <li>
                      <DatasetLink
                        path={`/publish/${datasetId}/overview`}
                        action={
                          props.publishingStatus === 'update_scheduled'
                            ? 'withdraw_update_revision'
                            : 'withdraw_first_revision'
                        }
                        queryParams={{ withdraw: 'true' }}
                      />
                    </li>
                  )}

                {props.canMoveGroup && (
                  <li>
                    <DatasetLink path="move" action="move" />
                  </li>
                )}
              </ul>
            </div>
            <div className="govuk-tabs__panel" id="history" role="tabpanel" aria-labelledby="tab_history">
              <p className="govuk-body">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
