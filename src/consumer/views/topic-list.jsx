import React from 'react';

import Layout from './components/Layout';
import Hero from './components/Hero';
import T from '../../shared/views/components/T';
import { useLocals } from '../../shared/views/context/Locals';

function Breadcrumbs({ parentTopics, selectedTopic }) {
  const { buildUrl, i18n } = useLocals();

  return (
    <div className="govuk-!-margin-bottom-8">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href={buildUrl(`/published`, i18n.language)}>
              Home
            </a>
          </li>

          {parentTopics.map((topic, index) => (
            <li className="govuk-breadcrumbs__list-item" key={topic.id}>
              {topic.id === selectedTopic.id ? (
                topic.name
              ) : (
                <a
                  className="govuk-breadcrumbs__link"
                  href={buildUrl(`/published/topic/${topic.id}/${topic.slug}`, i18n.language)}
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
          <a href={buildUrl(`/published/topic/${topic.id}/${topic.slug}`, i18n.language)}>
            <h3 className="govuk-heading-s govuk-!-margin-bottom-0">{topic.name}</h3>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Datasets({ datasets }) {
  const { buildUrl, i18n, dateFormat } = useLocals();

  return (
    <ul className="govuk-list">
      {datasets.map((dataset) => (
        <li className="index-list__item" key={dataset.id}>
          <a href={buildUrl(`/published/${dataset.id}`, i18n.language)}>
            <h3 className="govuk-heading-s govuk-!-margin-bottom-0">{dataset.title}</h3>
          </a>
          <div className="index-list__meta">
            <p className="govuk-!-margin-top-0">
              <span className="govuk-body-s caption index-list__item__meta">
                <T published={dateFormat(dataset.published_date, 'd MMMM yyyy')}>
                  consumer.topic_list.dataset.first_published
                </T>
              </span>
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
    <Layout {...props} title={title}>
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
                <T>consumer.topic_list.topic</T>
              </h2>
              <h1 className="govuk-heading-xl">{title}</h1>
            </>
          )}

          {props.childTopics?.length > 0 && <ChildTopics {...props} />}

          {props.datasets?.length > 0 && <Datasets {...props} />}
        </div>
      </div>
    </Layout>
  );
}
