import React from 'react';
import Layout from './components/Layout';

export default function Cookies(props) {
  return (
    <Layout {...props}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds" dangerouslySetInnerHTML={{ __html: props.content }} />
        <div style={{ position: 'sticky', top: '10px' }} className="govuk-grid-column-one-third">
          {props.tableOfContents && <h2 className="govuk-heading-s">{props.t('toc')}</h2>}
          <div dangerouslySetInnerHTML={{ __html: props.tableOfContents }}></div>
        </div>
      </div>
    </Layout>
  );
}
