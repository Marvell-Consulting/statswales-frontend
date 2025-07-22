import React from 'react';
import Layout from '../components/layouts/Consumer';

export default function NotFound(props) {
  const title = props.t('errors.not_found');
  return (
    <Layout {...props} title={title}>
      <h1 className="govuk-heading-xl">{title}</h1>
    </Layout>
  );
}
