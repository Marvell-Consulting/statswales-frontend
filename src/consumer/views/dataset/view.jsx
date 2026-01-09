import React from 'react';

import PublisherLayout from '../../../publisher/views/components/Layout';
import ConsumerLayout from '../components/Layout';
import { MultiPathBreadcrumbs } from '../components/Breadcrumbs';
import DatasetStatus from '../../../shared/views/components/dataset/DatasetStatus';
import Tabs from '../../../shared/views/components/Tabs';
import DeveloperView from '../../../publisher/views/components/developer/DeveloperView';
import NotificationBanner from '../components/NotificationBanner';
import DataTab from './components/DataTab';
import HistoryTab from './components/HistoryTab';
import AboutTab from './components/AboutTab';
import DownloadTab from './components/DownloadTab';

export default function ConsumerView(props) {
  const LayoutComponent = props.isDeveloper ? PublisherLayout : ConsumerLayout;
  const title = props.datasetMetadata.title;

  if (props.isUnpublished) {
    return (
      <LayoutComponent {...props} title={title}>
        <h1 className="govuk-heading-xl">{title}</h1>
        <NotificationBanner {...props} notification="consumer_view.unpublished_dataset" />
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent {...props} title={title}>
      <MultiPathBreadcrumbs {...props} />

      <h1 className="govuk-heading-xl">{title}</h1>

      {props.isArchived && <NotificationBanner {...props} notification="consumer_view.archived_dataset" />}

      {(props.preview || (props?.isDeveloper && props?.showDeveloperTab)) && <DatasetStatus {...props} />}
      {props.preview && (
        <div className="govuk-panel">
          <p className="govuk-panel__title-m">{props.t('publish.cube_preview.panel')}</p>
        </div>
      )}

      <Tabs
        title={props.t('toc')}
        tabs={[
          ...(props?.isDeveloper && props?.showDeveloperTab
            ? [{ label: props.t('developer.heading'), id: 'developer', children: <DeveloperView {...props} /> }]
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
