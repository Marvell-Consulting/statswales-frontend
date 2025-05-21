import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../components/RadioGroup';
import T from '../components/T';

export default function YearFormat(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl" id="year-type">
        {props.t('publish.year_format.heading')}
      </h1>

      <ErrorHandler {...props} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <form method="post" role="continue">
            <RadioGroup
              name="yearType"
              labelledBy="year-type"
              options={[
                {
                  value: 'YYYY',
                  label: 'YYYY',
                  hint: <T example="2024">publish.year_format.example</T>
                },
                {
                  value: 'YYYYYY',
                  label: 'YYYYYY',
                  hint: <T example="202324">publish.year_format.example</T>
                },
                {
                  value: 'YYYYYYYY',
                  label: 'YYYYYYYY',
                  hint: <T example="20232024">publish.year_format.example</T>
                },
                {
                  value: 'YYYY-YY',
                  label: 'YYYY-YY',
                  hint: <T example="2023-24">publish.year_format.example</T>
                },
                {
                  value: 'YYYY/YY',
                  label: 'YYYY/YY',
                  // slashes need escaping
                  hint: (
                    <T example="2023/24" raw>
                      publish.year_format.example
                    </T>
                  )
                },
                {
                  value: 'YYYY-YYYY',
                  label: 'YYYY-YYYY',
                  hint: <T example="2023-2024">publish.year_format.example</T>
                },
                {
                  value: 'YYYY/YYYY',
                  label: 'YYYY/YYYY',
                  // slashes need escaping
                  hint: (
                    <T example="2023/2024" raw>
                      publish.year_format.example
                    </T>
                  )
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
