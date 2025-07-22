import React from 'react';
import Layout from '../components/layouts/Consumer';

export default function Forbidden(props) {
  const title = props.t('errors.forbidden.heading');
  return (
    <Layout {...props} title={title}>
      <h1 className="govuk-heading-xl">{title}</h1>
      <p className="govuk-body">{props.t('errors.forbidden.description')}</p>
    </Layout>
  );
}
