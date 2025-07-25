import React, { Fragment } from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';

export default function Topics(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = returnLink;

  const title = props.t('publish.topics.heading');

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{title}</h1>
          <ErrorHandler />

          <form encType="multipart/form-data" method="post">
            <input type="hidden" name="topics" value="" />
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset" aria-describedby="topic-hint">
                <div
                  className="govuk-checkboxes govuk-checkboxes--small govuk-checkboxes--bg"
                  data-module="govuk-checkboxes"
                >
                  {props.nestedTopics.map((topic, index) => (
                    <Fragment key={index}>
                      <div className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id={`topic_${topic.id}`}
                          name="topics"
                          type="checkbox"
                          value={topic.id}
                          aria-controls={`conditional-topic-${topic.id}`}
                          defaultChecked={props.selectedTopics.includes(topic.id)}
                        />
                        <label className="govuk-label govuk-checkboxes__label" htmlFor={`topic_${topic.id}`}>
                          {topic.name}
                        </label>
                      </div>
                      {topic.children.length > 0 && (
                        <div className="govuk-checkboxes__conditional" id={`conditional-topic-${topic.id}`}>
                          {topic.children.map((childTopic, index) => (
                            <div key={index} className="govuk-checkboxes__item">
                              <input
                                className="govuk-checkboxes__input"
                                id={`topic_${childTopic.id}`}
                                name="topics"
                                type="checkbox"
                                value={childTopic.id}
                                defaultChecked={props.selectedTopics.includes(childTopic.id)}
                              />
                              <label className="govuk-label govuk-checkboxes__label" htmlFor={`topic_${childTopic.id}`}>
                                {childTopic.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              </fieldset>
            </div>
            <button type="submit" className="govuk-button" data-module="govuk-button">
              {props.t('buttons.continue')}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
