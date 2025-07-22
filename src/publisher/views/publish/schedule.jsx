import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';

export default function Schedule(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = returnLink;

  function Field({ name, width = 3 }) {
    return (
      <div className="govuk-date-input__item">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-date-input__label" htmlFor={`publication-${name}`}>
            {props.t(`publish.schedule.form.${name}.label`)}
          </label>
          <input
            className={clsx(`govuk-input govuk-date-input__input govuk-input--width-${width}`, {
              'govuk-input--error': props.errors?.find((e) => e.field === name)
            })}
            id={`publication-${name}`}
            name={name}
            type="text"
            inputMode="numeric"
            value={props.values?.[name] ? props.values[name] : ''}
          />
        </div>
      </div>
    );
  }

  const title = props.t('publish.schedule.heading');

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{title}</h1>

            <ErrorHandler />

            <form encType="multipart/form-data" method="post">
              <div className={clsx('govuk-form-group', { 'govuk-form-group--error': props.dateError })}>
                <fieldset className="govuk-fieldset" aria-describedby="publication-date-hint">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                    {props.t('publish.schedule.form.date.label')}
                  </legend>
                  <div id="publication-date-hint" className="govuk-hint">
                    {props.t('publish.schedule.form.date.hint')}
                  </div>
                  {props.dateError && (
                    <p id="publication-date-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {props.t(props.dateError.message.key)}
                    </p>
                  )}

                  <div className="govuk-date-input" id="publication-date">
                    <Field name="day" />
                    <Field name="month" />
                    <Field name="year" width={5} />
                  </div>
                </fieldset>
              </div>
              <div className={clsx('govuk-form-group', { 'govuk-form-group--error': props.timeError })}>
                <fieldset className="govuk-fieldset" aria-describedby="publication-time-hint">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                    {props.t('publish.schedule.form.time.label')}
                  </legend>
                  <div id="publication-time-hint" className="govuk-hint">
                    {props.t('publish.schedule.form.time.hint')}
                  </div>
                  {props.timeError && (
                    <p id="publication-time-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {props.t(props.timeError.message.key)}
                    </p>
                  )}

                  <Field name="hour" />
                  <Field name="minute" />
                </fieldset>
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
