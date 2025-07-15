import React from 'react';
import { addYears, format } from 'date-fns';
import clsx from 'clsx';

import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../components/RadioGroup';
import T from '../components/T';

export default function UpdateFrequency(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = returnLink;

  function Field({ name, value, width = 3 }) {
    return (
      <div className="govuk-date-input__item">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-date-input__label" htmlFor={`update-expected-date-${name}`}>
            {props.t(`publish.update_frequency.form.${name}.label`)}
          </label>
          <input
            className={clsx(`govuk-input govuk-date-input__input govuk-input--width-${width}`, {
              'govuk-input--error': props.errors?.find((e) => e.field === name)
            })}
            id={`update-expected-date-${name}`}
            name={name}
            type="text"
            inputMode="numeric"
            defaultValue={value}
          />
        </div>
      </div>
    );
  }

  const oneYearFromNow = format(addYears(new Date(), 1), 'dd MM yyyy');

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl" id="is-updated">
              {props.t('publish.update_frequency.heading')}
            </h1>

            <form encType="multipart/form-data" method="post">
              <ErrorHandler />

              <RadioGroup
                name="update_type"
                labelledBy="is-updated"
                options={[
                  {
                    value: 'update',
                    label: <T>publish.update_frequency.form.update_type.options.update.label</T>,
                    children: (
                      <div
                        className={clsx('govuk-form-group', {
                          'govuk-form-group--error': props.errors?.find((e) =>
                            ['update_day', 'update_month', 'update_year'].includes(e.field)
                          )
                        })}
                      >
                        <fieldset className="govuk-fieldset" role="group" aria-describedby="isUpdatedUpdate">
                          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                            <T>publish.update_frequency.form.date.label</T>
                          </legend>
                          <div id="update-expected-hint" className="govuk-hint">
                            <T example={oneYearFromNow}>publish.update_frequency.form.date.hint</T>
                          </div>

                          {props.dateError && (
                            <p id="publication-date-error" className="govuk-error-message">
                              <span className="govuk-visually-hidden">Error:</span> {props.t(props.dateError.message.key)}
                            </p>
                          )}

                          <div className="govuk-date-input" id="update-expected-date">
                            <Field name="day" value={props.update_frequency?.date?.day} />
                            <Field name="month" value={props.update_frequency?.date?.month} />
                            <Field name="year" value={props.update_frequency?.date?.year} width={5} />
                          </div>
                        </fieldset>
                      </div>
                    )
                  },
                  {
                    value: 'replacement',
                    label: <T>publish.update_frequency.form.update_type.options.replacement.label</T>
                  },
                  {
                    value: 'none',
                    label: <T>publish.update_frequency.form.update_type.options.none.label</T>
                  }
                ]}
                value={props.update_frequency?.update_type}
              />

              <button type="submit" className="govuk-button" data-module="govuk-button">
                <T>buttons.continue</T>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
