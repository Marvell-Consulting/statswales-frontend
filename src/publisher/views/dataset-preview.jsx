import React from 'react';

import PublisherLayout from './components/Layout';
import ConsumerLayout from '../../consumer/views/components/Layout';
import { MultiPathBreadcrumbs } from '../../consumer/views/components/Breadcrumbs';
import DatasetStatus from '../../shared/views/components/dataset/DatasetStatus';
import Tabs from '../../shared/views/components/Tabs';
import DeveloperTab from './components/developer/DeveloperTab';
import NotificationBanner from '../../consumer/views/components/NotificationBanner';
import DataTab from '../../consumer/views/dataset/components/DataTab';
import HistoryTab from '../../consumer/views/dataset/components/HistoryTab';
import AboutTab from '../../consumer/views/dataset/components/AboutTab';
import DownloadTab from '../../consumer/views/dataset/components/DownloadTab';

export default function Preview(props) {
  const LayoutComponent = props.isDeveloper ? PublisherLayout : ConsumerLayout;
  const title = props.datasetMetadata.title;

  return (
    <LayoutComponent {...props} title={title}>
      <MultiPathBreadcrumbs {...props} />

      <h1 className="govuk-heading-xl">{title}</h1>

      {props.isArchived && <NotificationBanner {...props} notification="consumer_view.archived_dataset" />}

      <DatasetStatus {...props} />

      <div className="govuk-panel">
        <p className="govuk-panel__title-m">{props.t('publish.cube_preview.panel')}</p>
      </div>

      <Tabs
        title={props.t('toc')}
        tabs={[
          ...(props.isDevPreview
            ? [{ label: props.t('developer.heading'), id: 'developer', children: <DeveloperTab {...props} /> }]
            : []),
          { label: props.t('consumer_view.tabs.data'), id: 'data', children: <DataTab {...props} /> },
          { label: props.t('consumer_view.tabs.history'), id: 'history', children: <HistoryTab {...props} /> },
          { label: props.t('consumer_view.tabs.about'), id: 'about', children: <AboutTab {...props} /> },
          { label: props.t('consumer_view.tabs.downloads'), id: 'downloads', children: <DownloadTab {...props} /> }
        ]}
      />
    </LayoutComponent>
  );
}
