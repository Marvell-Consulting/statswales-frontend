import React from 'react';

import Layout from '../components/layouts/Publisher';
import Hero from '../components/consumer/Hero';
import T from '../components/T';

export default function Homepage(props) {
  return (
    <Layout {...props}>
      <Hero>
        <div className="govuk-width-container">
          <div className="govuk-grid-row govuk-!-margin-bottom-6">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl govuk-!-margin-top-6">
                <T>consumer.homepage.heading</T>
              </h1>
            </div>
          </div>
        </div>
      </Hero>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-m">
             <T>consumer.homepage.topics</T>
          </h2>

          <ul className="govuk-list">
            { props.topics.map((topic) => (
              <li className="index-list__item" key={topic.id}>
                <a href={props.buildUrl(`/published/topics/${topic.id}`, props.i18n.language)}>
                  <h3 className="govuk-!-margin-bottom-0">{topic.name}</h3>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
