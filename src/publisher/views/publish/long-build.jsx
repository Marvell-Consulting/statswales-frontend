import React from 'react';

import Layout from '../components/Layout';
import DatasetStatus from '../../../shared/views/components/dataset/DatasetStatus';
import T from '../../../shared/views/components/T';

export default function LongBuild(props) {
  return (
    <Layout {...props} title={props.title}>
      <span className="region-subhead">
        <T>publish.overview.subheading</T>
      </span>
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{props.title}</h1>

      <DatasetStatus {...props} />
    </Layout>
  );
}
