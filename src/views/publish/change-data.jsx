import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import T from '../components/T';

export default function ChangeData(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.datasetId && props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl" id="change-data">
        <T>publish.change_data.title</T>
      </h1>
      <ErrorHandler />

      <form encType="multipart/form-data" method="post">
        <RadioGroup
          name="change"
          labelledBy="change-data"
          options={[
            {
              value: 'table',
              label: <T>publish.change_data.change_table.label</T>,
              hint: <T>publish.change_data.change_table.description</T>
            },
            {
              value: 'columns',
              label: <T>publish.change_data.change_columns.label</T>,
              hint: <T>publish.change_data.change_columns.description</T>
            }
          ]}
        />

        <div className="govuk-button-group">
          <button type="submit" className="govuk-button" data-module="govuk-button">
            {props.t('buttons.continue')}
          </button>
        </div>
      </form>
    </Layout>
  );
}
