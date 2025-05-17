import React from 'react';
import Layout from './components/layouts/Publisher';

export default function Guidance(props) {
  return (
    <Layout {...props}>
      <div className="govuk-width-container app-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds" dangerouslySetInnerHTML={{ __html: props.content }} />
            <div style={{ position: 'sticky', top: '10px' }} className="govuk-grid-column-one-third">
              {props.tableOfContents && <h2 className="govuk-heading-s">{props.t('toc')}</h2>}
              <div dangerouslySetInnerHTML={{ __html: props.tableOfContents }}></div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
