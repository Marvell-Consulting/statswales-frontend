import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../../../shared/views/components/RadioGroup';

export default function MonthFormat(props) {
  const backLink = props.buildUrl(
    `/publish/${props.datasetId}/dates/${props.dimension.id}/period/type`,
    props.i18n.language
  );
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const title = props.t('publish.month_format.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl" id="month-format">
        {title}
      </h1>

      <ErrorHandler />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <form method="post" role="continue">
            <RadioGroup
              name="monthFormat"
              labelledBy="month-format"
              options={[
                {
                  value: 'MMM',
                  label: 'MMM',
                  hint: props.t('publish.month_format.example', { example: 'Jan' })
                },
                {
                  value: 'mMM',
                  label: 'mMM',
                  hint: props.t('publish.month_format.example', { example: '01' })
                },
                {
                  value: 'mm',
                  label: 'MM',
                  hint: props.t('publish.month_format.example', { example: '01' })
                }
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
