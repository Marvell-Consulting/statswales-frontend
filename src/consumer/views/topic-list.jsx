import React from 'react';
import clsx from 'clsx';

import Layout from './components/Layout';
import Hero from './components/Hero';
import T from '../../shared/views/components/T';
import { useLocals } from '../../shared/views/context/Locals';
import Pagination from '../../shared/views/components/Pagination';

function Breadcrumbs({ parentTopics, selectedTopic }) {
  const { buildUrl, i18n } = useLocals();

  return (
    <div className="govuk-!-margin-bottom-8">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href={buildUrl(`/`, i18n.language)}>
              <T>breadcrumbs.home</T>
            </a>
          </li>

          {parentTopics.map((topic) => (
            <li className="govuk-breadcrumbs__list-item" key={topic.id}>
              {topic.id === selectedTopic.id ? (
                topic.name
              ) : (
                <a
                  className="govuk-breadcrumbs__link"
                  href={buildUrl(`/topic/${topic.id}/${topic.slug}`, i18n.language)}
                >
                  {topic.name}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

function ChildTopics({ childTopics }) {
  const { buildUrl, i18n } = useLocals();

  return (
    <ul className="govuk-list">
      {childTopics.map((topic) => (
        <li className="index-list__item" key={topic.id}>
          <a
            className="govuk-heading-s govuk-!-margin-bottom-0 govuk-link inline"
            href={buildUrl(`/topic/${topic.id}/${topic.slug}`, i18n.language)}
          >
            {topic.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Datasets({ datasets }) {
  const { buildUrl, i18n, dateFormat, statusToColour } = useLocals();

  return (
    <ul className="govuk-list">
      {datasets.map((dataset) => (
        <li className="index-list__item" key={dataset.id}>
          <a
            className="govuk-heading-s govuk-!-margin-bottom-0 govuk-link inline"
            href={buildUrl(`/${dataset.id}`, i18n.language)}
          >
            {dataset.title}
          </a>
          <div className="index-list__meta">
            <p className="govuk-!-margin-top-0">
              {dataset.archived_at && (
                <strong
                  className={clsx(
                    'govuk-tag',
                    'dataset-status ',
                    `govuk-tag--${statusToColour('archived')}`,
                    'govuk-!-margin-right-2'
                  )}
                >
                  <T>consumer.topic_list.status.archived</T>
                </strong>
              )}
              <span className="govuk-body-s caption index-list__item__meta">
                <T published={dateFormat(dataset.first_published_at, 'd MMMM yyyy', { locale: i18n.language })}>
                  consumer.topic_list.dataset.first_published
                </T>
              </span>
              {dataset.last_updated_at !== dataset.first_published_at && (
                <span className="govuk-body-s caption index-list__item__meta">
                  <T updated={dateFormat(dataset.last_updated_at, 'd MMMM yyyy', { locale: i18n.language })}>
                    consumer.topic_list.dataset.last_updated
                  </T>
                </span>
              )}
              {dataset.archived_at && (
                <span className="govuk-body-s caption index-list__item__meta">
                  <T archived={dateFormat(dataset.archived_at, 'd MMMM yyyy', { locale: i18n.language })}>
                    consumer.topic_list.dataset.archived
                  </T>
                </span>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function TopicList(props) {
  const title = props.selectedTopic ? props.selectedTopic.name : props.t('consumer.topic_list.heading');
  return (
    <Layout {...props} noPad={true} title={title}>
      {!props.selectedTopic && (
        <Hero>
          <div className="govuk-width-container">
            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-two-thirds">
                <h1 className="govuk-heading-xl govuk-!-margin-top-6">{title}</h1>
              </div>
            </div>
          </div>
        </Hero>
      )}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p>
            <T url={props.consumerApiUrl} raw>
              consumer.topic_list.api
            </T>
          </p>

          {!props.selectedTopic && (
            <h2 className="govuk-heading-l">
              <T>consumer.topic_list.topics</T>
            </h2>
          )}

          {props.selectedTopic && (
            <>
              <Breadcrumbs {...props} />
              <h2 className="topic-subhead">
                <T>{props.parentTopics.length > 0 ? 'consumer.topic_list.sub_topic' : 'consumer.topic_list.topic'}</T>
              </h2>
              <h1 className="govuk-heading-xl">{title}</h1>
            </>
          )}

          {props.childTopics?.length > 0 && <ChildTopics {...props} />}

          {props.datasets?.length > 0 && (
            <>
              <Datasets {...props} />
              <Pagination {...props} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
