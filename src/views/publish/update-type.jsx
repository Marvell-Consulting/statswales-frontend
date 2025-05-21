import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../components/RadioGroup';
import T from '../components/T';

export default function UpdateType(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <ErrorHandler {...props} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <form method="post" role="continue" id="updateType">
            <RadioGroup
              name="updateType"
              label={<T>publish.update_type.heading</T>}
              options={[
                { value: 'add', label: <T>publish.update_type.add</T> },
                { value: 'add_revise', label: <T>publish.update_type.add_revise</T> },
                { value: 'revise', label: <T>publish.update_type.revise</T> },
                { value: 'replace_all', label: <T>publish.update_type.replace_all</T> }
              ]}
            />

            <div className="govuk-button-group">
              <button
                type="submit"
                name="confirm"
                value="true"
                className="govuk-button"
                data-module="govuk-button"
                style={{ verticalAlign: 'unset' }}
                data-prevent-double-click="true"
              >
                {props.t('buttons.continue')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
