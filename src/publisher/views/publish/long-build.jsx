import React from 'react';

import Layout from '../components/Layout';
import DatasetStatus from '../../../shared/views/components/dataset/DatasetStatus';
import T from '../../../shared/views/components/T';
import LongBuildMonitor from './long-build-monitor';

export default function LongBuild(props) {
  return (
    <Layout {...props} title={props.title}>
      <span className="region-subhead">
        <T>publish.overview.subheading</T>
      </span>
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{props.title}</h1>

      <DatasetStatus {...props} />

      <div className="govuk-grid-row">
        <div
          className="govuk-grid-column-two-thirds"
          id="build_fragment"
          data-refresh-url={props.buildUrl(
            `/publish/${props.datasetId}/build/${props.buildLogEntry.id}/refresh`,
            props.language
          )}
        >
          <LongBuildMonitor {...props} />
        </div>
      </div>
      <script src="/assets/js/long-build.js"></script>
    </Layout>
  );
}
