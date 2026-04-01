import React from 'react';

import ConsumerLayout from '../components/Layout';
import { MultiPathBreadcrumbs } from '../components/Breadcrumbs';
import Tabs from '../../../shared/views/components/Tabs';
import NotificationBanner from '../components/NotificationBanner';
import DataTab from './components/DataTab';
import HistoryTab from './components/HistoryTab';
import AboutTab from './components/AboutTab';
import DownloadTab from './components/DownloadTab';

export default function ConsumerView(props) {
  const title = props.datasetMetadata.title;

  if (props.isUnpublished) {
    return (
      <ConsumerLayout {...props} title={title}>
        <h1 className="govuk-heading-xl">{title}</h1>
        <NotificationBanner {...props} notification="consumer_view.unpublished_dataset" />
      </ConsumerLayout>
    );
  }

  return (
    <ConsumerLayout {...props} title={title}>
      <MultiPathBreadcrumbs {...props} />
      <h1 className="govuk-heading-xl">{title}</h1>

      {props.isArchived && (
        <NotificationBanner
          notification={
            props.replacedBy ? (
              <>
                {props.t('consumer_view.archived_dataset_with_replacement')}{' '}
                <a
                  className="govuk-notification-banner__link govuk-!-font-size-27"
                  href={props.buildUrl(`/${props.replacedBy.dataset_id}`, props.i18n.language)}
                >
                  {props.t('consumer_view.archived_dataset_replacement_link')}
                </a>
              </>
            ) : (
              props.t('consumer_view.archived_dataset')
            )
          }
        />
      )}

      <Tabs
        id="dataset-nav"
        title={props.t('toc')}
        tabs={[
          { label: props.t('consumer_view.tabs.data'), id: 'data', children: <DataTab {...props} /> },
          { label: props.t('consumer_view.tabs.downloads'), id: 'downloads', children: <DownloadTab {...props} /> },
          { label: props.t('consumer_view.tabs.history'), id: 'history', children: <HistoryTab {...props} /> },
          { label: props.t('consumer_view.tabs.about'), id: 'about', children: <AboutTab {...props} /> }
        ]}
      />
    </ConsumerLayout>
  );
}
