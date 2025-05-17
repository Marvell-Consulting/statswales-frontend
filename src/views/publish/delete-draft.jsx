import React from 'react';
import Layout from '../components/layouts/Publisher';
import DatasetStatus from '../components/dataset/DatasetStatus';
import ErrorHandler from '../components/ErrorHandler';

export default function DeleteDraft(props) {
  const backLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="form-background">
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper " id="main-content" role="main">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{props.datasetTitle}</h1>
              </div>
            </div>

            <DatasetStatus {...props} />

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <ErrorHandler {...props} />
                <div className="warning-background">
                  <div className="govuk-error-message alert-warning">
                    <form method="post">
                      <fieldset className="govuk-fieldset" role="group">
                        <h2 className="govuk-heading-l">
                          {props.t(
                            `publish.delete_draft.${props.publishingStatus === 'incomplete' ? 'dataset' : 'update'}.heading`
                          )}
                        </h2>

                        <p className="govuk-heading-s">
                          {props.t(
                            `publish.delete_draft.${props.publishingStatus === 'incomplete' ? 'dataset' : 'update'}.message`
                          )}
                        </p>

                        <button className="govuk-button govuk-button--warning" data-module="govuk-button">
                          {props.t(
                            `publish.delete_draft.${props.publishingStatus === 'incomplete' ? 'dataset' : 'update'}.button`
                          )}
                        </button>
                      </fieldset>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}
