import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../components/RadioGroup';
import T from '../components/T';

export default function YearType(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.revisit
    ? props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}/change-format`, props.i18n.language)
    : props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl" id="year-type">
        {props.t('publish.year_type.heading')}
      </h1>

      <ErrorHandler />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <form method="post" role="continue">
            <RadioGroup
              name="yearType"
              labelledBy="year-type"
              options={[
                {
                  value: 'calendar',
                  label: <T>publish.year_type.chooser.calendar</T>,
                  hint: <T>publish.year_type.chooser.calendar-hint</T>
                },
                {
                  value: 'meteorological',
                  label: <T>publish.year_type.chooser.meteorological</T>,
                  hint: <T>publish.year_type.chooser.meteorological-hint</T>
                },
                {
                  value: 'financial',
                  label: <T>publish.year_type.chooser.financial</T>,
                  hint: <T>publish.year_type.chooser.financial-hint</T>
                },
                {
                  value: 'tax',
                  label: <T>publish.year_type.chooser.tax</T>,
                  hint: <T>publish.year_type.chooser.tax-hint</T>
                },
                {
                  value: 'academic',
                  label: <T>publish.year_type.chooser.academic</T>,
                  hint: <T>publish.year_type.chooser.academic-hint</T>
                },
                {
                  value: 'rolling',
                  label: <T>publish.year_type.chooser.rolling</T>,
                  hint: <T>publish.year_type.chooser.rolling-hint</T>,
                  children: [
                    <>
                      <h2 className="govuk-fieldset__heading">
                        <T>publish.year_type.chooser.rolling-start-date</T>
                      </h2>
                      ,
                      <p className="govuk-hint">
                        <T>publish.year_type.chooser.rolling-start-date-hint</T>
                      </p>
                      ,
                      <div className="govuk-date-input">
                        <div className="govuk-date-input__item">
                          <div className="govuk-form-group">
                            <label className="govuk-label, govuk-date-input__label" htmlFor="start_day">
                              <T>publish.year_type.chooser.day</T>
                            </label>
                            <input
                              className="govuk-input govuk-date-input__input govuk-input--width-2"
                              type="text"
                              name="start_day"
                              placeholder="DD"
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                        <div className="govuk-date-input__item">
                          <div className="govuk-form-group">
                            <label className="govuk-label, govuk-date-input__label" htmlFor="start_month">
                              <T>publish.year_type.chooser.month</T>
                            </label>
                            <input
                              className="govuk-input govuk-date-input__input govuk-input--width-2"
                              type="text"
                              name="start_month"
                              placeholder="MM"
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ]
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
