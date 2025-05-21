import React from 'react';
import ErrorHandler from '../components/ErrorHandler';
import Layout from '../components/layouts/Publisher';

export default function Start(props) {
  return (
    <Layout {...props}>
      <h1 className="govuk-heading-xl">{props.t('publish.start.title')}</h1>
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
