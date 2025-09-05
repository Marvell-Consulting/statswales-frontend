import React from 'react';

import Layout from '../../components/Layout';
import FlashMessages from '../../../../shared/views/components/FlashMessages';
import ErrorHandler from '../../components/ErrorHandler';
import DatasetStatus from '../../../../shared/views/components/dataset/DatasetStatus';
import Tabs from '../../../../shared/views/components/Tabs';
import T from '../../../../shared/views/components/T';
import { ActionsTab } from './ActionsTab';
import { HistoryTab } from './HistoryTab';

export default function Overview(props) {
  const openPublishTask = props.openTasks.find((task) => task.action === 'publish');
  const openUnpublishTask = props.openTasks.find((task) => task.action === 'unpublish');
  const openArchiveTask = props.openTasks.find((task) => task.action === 'archive');

  return (
    <Layout {...props} title={props.title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <FlashMessages />

          <span className="region-subhead">{props.t('publish.overview.subheading')}</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{props.title}</h1>

          <DatasetStatus {...props} />
          <ErrorHandler />

          <div className="overview-details">
            {openPublishTask && (
              <>
                <p
                  className="govuk-body govuk-!-margin-0"
                  dangerouslySetInnerHTML={{
                    __html: props.t('publish.overview.publish.pending.publish_at', {
                      publishAt: props.dateFormat(props.revision?.publish_at, 'h:mmaaa, d MMMM yyyy', {
                        locale: props.i18n.language
                      })
                    })
                  }}
                />
                <p
                  className="govuk-body govuk-!-margin-0"
                  dangerouslySetInnerHTML={{
                    __html: props.t('publish.overview.publish.pending.requested_by', {
                      userName: openPublishTask?.created_by_name
                    })
                  }}
                />
              </>
            )}

            {openUnpublishTask && (
              <>
                <p className="govuk-body govuk-!-margin-0"></p>
                <p
                  className="govuk-body govuk-!-margin-0"
                  dangerouslySetInnerHTML={{
                    __html: props.t('publish.overview.unpublish.pending.requested_by', {
                      userName: openUnpublishTask?.created_by_name
                    })
                  }}
                />
              </>
            )}

            {openArchiveTask && (
              <>
                <p className="govuk-body govuk-!-margin-0"></p>
                <p
                  className="govuk-body govuk-!-margin-0"
                  dangerouslySetInnerHTML={{
                    __html: props.t('publish.overview.archive.pending.requested_by', {
                      userName: openArchiveTask?.created_by_name
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
                    publishAt: props.dateFormat(props.revision?.publish_at, 'h:mmaaa, d MMMM yyyy', {
                      locale: props.i18n.language
                    })
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
