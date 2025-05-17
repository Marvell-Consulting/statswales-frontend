import React from 'react';
import Layout from '../components/layouts/Publisher';
import FlashMessages from '../components/FlashMessages';
import DatasetStatus from '../components/dataset/DatasetStatus';
import ErrorHandler from '../components/ErrorHandler';

export default function Overview(props) {
  function DatasetLink({ path = '', translationKey, action, translationProps = {}, newTab }) {
    return (
      <li>
        <a
          className="govuk-link govuk-link--no-underline"
          href={props.buildUrl(
            translationKey || `/publish/${props.dataset.id}/${path}`,
            props.i18n.language,
            translationProps
          )}
          target={newTab ? '_blank' : undefined}
        >
          {props.t(`publish.overview.actions.${action}`)}
        </a>
      </li>
    );
  }

  return (
    <Layout {...props}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <FlashMessages {...props} />

          {props.publishingStatus === 'scheduled' && props.justScheduled && (
            <div
              className="govuk-notification-banner govuk-notification-banner--success"
              role="alert"
              aria-labelledby="govuk-notification-banner-title"
              data-module="govuk-notification-banner"
            >
              <div className="govuk-notification-banner__header">
                <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                  {props.t('publish.overview.scheduled.notification.header')}
                </h2>
              </div>
              <div className="govuk-notification-banner__content">
                <h3 className="govuk-notification-banner__heading">
                  {props.t('publish.overview.scheduled.notification.content')}
                </h3>
              </div>
            </div>
          )}

          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{props.title}</h1>

          <DatasetStatus {...props} />
          <ErrorHandler {...props} />

          {props.publishingStatus === 'scheduled' && (
            <p
              className="govuk-body"
              dangerouslySetInnerHTML={{
                __html: props.t('publish.overview.scheduled.publish_at', {
                  publish_at: props.dateFormat(props.revision?.publish_at, 'h:mmaaa, d MMMM yyyy')
                })
              }}
            />
          )}

          <h2 className="govuk-heading-m">{props.t('publish.overview.scheduled.what_next')}</h2>

          <div className="actions">
            <ul className="govuk-list">
              {props.publishingStatus === 'incomplete' && <DatasetLink path="tasklist" action="continue" />}
              {props.publishingStatus === 'update_incomplete' && (
                <DatasetLink path="tasklist" action="continue_update" />
              )}
              {props.datasetStatus === 'live' && (
                <DatasetLink translationKey={`/published/${props.dataset.id}`} action="view_published_dataset" newTab />
              )}
              {props.publishingStatus === 'published' ? (
                <DatasetLink path="update" action="update_dataset" />
              ) : (
                <DatasetLink path="cube_preview" action="preview" />
              )}
              {props.publishingStatus === 'scheduled' && (
                <DatasetLink path="overview" action="withdraw_first_revision" translationProps={{ withdraw: 'true' }} />
              )}

              {props.publishingStatus === 'update_scheduled' && (
                <>
                  <DatasetLink path="cube-preview" action="preview" />
                  <DatasetLink
                    path="overview"
                    action="withdraw_update_revision"
                    translationProps={{ withdraw: 'true' }}
                  />
                </>
              )}

              {props.canMoveGroup && <DatasetLink path="move" action="move" />}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
