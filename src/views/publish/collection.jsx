import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';

export default function Collection(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.returnLink;
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{props.t('publish.collection.heading')}</h1>

            <ErrorHandler />

            <p className="govuk-body">{props.t('publish.collection.explain')}</p>

            <ul className="govuk-list govuk-list--bullet">
              <li>{props.t('publish.collection.explain_1')}</li>
              <li>{props.t('publish.collection.explain_2')}</li>
              <li>{props.t('publish.collection.explain_3')}</li>
            </ul>

            <div className="govuk-hint">{props.t('publish.collection.language')}</div>

            <form encType="multipart/form-data" method="post">
              <div className="govuk-form-group">
                <textarea
                  className={clsx('govuk-textarea', {
                    'govuk-textarea--error': props.errors?.find((e) => e.field === 'collection')
                  })}
                  id="collection"
                  name="collection"
                  rows="15"
                  defaultValue={props.collection}
                />
              </div>
              <button type="submit" className="govuk-button" data-module="govuk-button">
                {props.t('buttons.continue')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
