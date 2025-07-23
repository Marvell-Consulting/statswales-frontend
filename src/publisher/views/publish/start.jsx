import React from 'react';
import ErrorHandler from '../components/ErrorHandler';
import Layout from '../components/Layout';

export default function Start(props) {
  const title = props.t('publish.start.title');
  return (
    <Layout {...props} title={title}>
      <h1 className="govuk-heading-xl">{title}</h1>
      <ErrorHandler />

      <p className="govuk-body">{props.t('publish.start.p1')}</p>

      <ul className="govuk-list govuk-list--bullet">
        <li>{props.t('publish.start.data_table')}</li>
        <li>{props.t('publish.start.lookup_table')}</li>
        <li>{props.t('publish.start.metadata')}</li>
      </ul>

      <div className="govuk-button-group">
        <a href={props.buildUrl(`/publish/${props.nextStep}`, props.i18n.language)} className="govuk-button">
          {props.t('buttons.continue')}
        </a>
      </div>
    </Layout>
  );
}
