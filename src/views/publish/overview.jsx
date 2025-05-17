import React from 'react';
import Layout from '../components/layouts/Publisher';
import FlashMessages from '../components/FlashMessages';
import ErrorHandler from '../components/ErrorHandler';
import DatasetStatus from '../components/dataset/DatasetStatus';

export default function Overview(props) {
  return (
    <Layout>
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
                  {props.t('publish.overview.submitted.notification.content')}
                </p>
              </div>
            </div>
          )}

          <span className="region-subhead">{props.t('publish.overview.subheading')}</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{props.title}</h1>

          <DatasetStatus {...props} />
          <ErrorHandler {...props} />

          <div className="overview-details">
            {props.publishingStatus === 'pending_approval' && (
              <>
                <p
                  className="govuk-body govuk-!-margin-0"
                  dangerouslySetInnerHTML={{
                    __html: props.t('publish.overview.pending.publish_at', {
                      publishAt: props.dateFormat(props.revision?.publish_at, 'h:mmaaa, d MMMM yyyy')
                    })
                  }}
                />
                <p className="govuk-body govuk-!-margin-0">
                  {props.t('publish.overview.pending.requested_by', {
                    userName: props.openPublishTask?.created_by_name
                  })}
                </p>

                {props.canApprove && (
                  <a
                    className="govuk-button govuk-!-margin-top-4"
                    href={props.buildUrl(
                      `/publish/${props.dataset.id}/task-decision/${props.openPublishTask?.id}`,
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
                  href={props.buildUrl(`/publish/${props.dataset.id}/tasklist`, props.i18n.language)}
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
                      tabindex="0"
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
                      tabindex="-1"
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
                    <a
                      className="govuk-link govuk-link--no-underline"
                      href={props.buildUrl(`/publish/${props.dataset.id}/tasklist`, props.i18n.language)}
                    >
                      {props.t('publish.overview.actions.continue')}
                    </a>
                  </li>
                )}

                {props.canEdit && props.publishingStatus === 'update_incomplete' && (
                  <li>
                    <a
                      className="govuk-link govuk-link--no-underline"
                      href={props.buildUrl(`/publish/${props.dataset.id}/tasklist`, props.i18n.language)}
                    >
                      {props.t('publish.overview.actions.continue_update')}
                    </a>
                  </li>
                )}

                {props.datasetStatus === 'live' && (
                  <li>
                    <a
                      className="govuk-link govuk-link--no-underline"
                      href={props.buildUrl(`/published/${props.dataset.id}`, props.i18n.language)}
                      target="_blank"
                    >
                      {props.t('publish.overview.actions.view_published_dataset')}
                    </a>
                  </li>
                )}

                {props.canEdit && props.publishingStatus === 'published' && (
                  <li>
                    <a
                      className="govuk-link govuk-link--no-underline"
                      href={props.buildUrl(`/publish/${props.dataset.id}/update`, props.i18n.language)}
                    >
                      {props.t('publish.overview.actions.update_dataset')}
                    </a>
                  </li>
                )}

                {props.publishingStatus !== 'published' && (
                  <li>
                    <a
                      className="govuk-link govuk-link--no-underline"
                      href={props.buildUrl(`/publish/${props.dataset.id}/cube-preview`, props.i18n.language)}
                    >
                      {props.t('publish.overview.actions.preview')}
                    </a>
                  </li>
                )}

                {props.canEdit &&
                  ['pending_approval', 'scheduled', 'update_scheduled'].includes(props.publishingStatus) && (
                    <li>
                      <a
                        className="govuk-link govuk-link--no-underline"
                        href={props.buildUrl(`/publish/${props.dataset.id}/overview`, props.i18n.language, {
                          withdraw: 'true'
                        })}
                      >
                        {props.t(
                          `publish.overview.actions.${props.publishingStatus === 'update_scheduled' ? 'withdraw_update_revision' : 'withdraw_first_revision'}`
                        )}
                      </a>
                    </li>
                  )}

                {props.canMoveGroup && (
                  <li>
                    <a
                      className="govuk-link govuk-link--no-underline"
                      href={props.buildUrl(`/publish/${props.dataset.id}/move`, props.i18n.language)}
                    >
                      {props.t('publish.overview.actions.move')}
                    </a>
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
