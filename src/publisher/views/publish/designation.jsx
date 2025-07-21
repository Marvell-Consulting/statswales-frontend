import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../components/RadioGroup';

export default function Designation(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = returnLink;
  const title = props.t('publish.designation.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl" id="designation">
              {title}
            </h1>

            <form encType="multipart/form-data" method="post">
              <ErrorHandler />

              <RadioGroup
                name="designation"
                labelledBy="designation"
                options={props.designationOptions.map((option) => ({
                  value: option,
                  label: props.t(`publish.designation.form.designation.options.${option}.label`)
                }))}
                value={props.designation}
              />

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
