import React from 'react';

import ConsumerLayout from '../components/Layout';
import { MultiPathBreadcrumbs } from '../components/Breadcrumbs';
import Tabs from '../../../shared/views/components/Tabs';
import NotificationBanner from '../components/NotificationBanner';
import HistoryTab from './components/HistoryTab';
import AboutTab from './components/AboutTab';
import LandingTab from './components/LandingTab';

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

      {props.isArchived && <NotificationBanner {...props} notification="consumer_view.archived_dataset" />}

      <Tabs
        title={props.t('toc')}
        tabs={[
          { label: props.t('consumer_view.tabs.data'), id: 'data', children: <LandingTab {...props} /> },
          { label: props.t('consumer_view.tabs.history'), id: 'history', children: <HistoryTab {...props} /> },
          { label: props.t('consumer_view.tabs.about'), id: 'about', children: <AboutTab {...props} /> }
        ]}
      />
    </ConsumerLayout>
  );
}
