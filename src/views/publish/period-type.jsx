import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../components/RadioGroup';

export default function PeriodType(props) {
  const backLink = props.buildUrl(
    `/publish/${props.datasetId}/dates/${props.dimension.id}/period/year-format`,
    props.i18n.language
  );
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl" id="period-type">
        {props.t('publish.period-type-chooser.heading')}
      </h1>

      <ErrorHandler {...props} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <form method="post" role="continue">
            <RadioGroup
              name="periodType"
              labelledBy="period-type"
              options={[
                {
                  value: 'years',
                  label: props.t('publish.period-type-chooser.chooser.years')
                },
                {
                  value: 'quarters',
                  label: props.t('publish.period-type-chooser.chooser.quarters')
                },
                {
                  value: 'months',
                  label: props.t('publish.period-type-chooser.chooser.months')
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
