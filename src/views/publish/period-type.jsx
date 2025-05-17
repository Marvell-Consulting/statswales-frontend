import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function PeriodType(props) {
  const backLink = props.buildUrl(
    `/publish/${props.datasetId}/dates/${props.dimension.id}/period/year-format`,
    props.i18n.language
  );
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl">{props.t('publish.period-type-chooser.heading')}</h1>

      <ErrorHandler {...props} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <form method="post" role="continue">
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <div className="govuk-radios" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="periodTypeChooserYears"
                      name="periodType"
                      type="radio"
                      value="years"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="periodTypeChooserYears">
                      {props.t('publish.period-type-chooser.chooser.years')}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="periodTypeChooserQuarters"
                      name="periodType"
                      type="radio"
                      value="quarters"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="periodTypeChooserQuarters">
                      {props.t('publish.period-type-chooser.chooser.quarters')}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="periodTypeChooserMonths"
                      name="periodType"
                      type="radio"
                      value="months"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="periodTypeChooserMonths">
                      {props.t('publish.period-type-chooser.chooser.months')}
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
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
