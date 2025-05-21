import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';
import RadioGroup from '../components/RadioGroup';
import T from '../components/T';

export default function UpdateFrequency(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl" id="is-updated">
              {props.t('publish.update_frequency.heading')}
            </h1>

            <form encType="multipart/form-data" method="post">
              <ErrorHandler {...props} />

              <RadioGroup
                name="is_updated"
                labelledBy="is-updated"
                options={[
                  {
                    value: 'true',
                    label: <T>publish.update_frequency.form.is_updated.options.yes.label</T>,
                    children: (
                      <div
                        className={clsx('govuk-form-group', {
                          'govuk-form-group--error': props.errors?.find((e) =>
                            ['frequency_unit', 'frequency_value'].includes(e.field)
                          )
                        })}
                      >
                        <fieldset className="govuk-fieldset" role="group" aria-describedby="isUpdatedYes">
                          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                            <T>publish.update_frequency.form.frequency_value.label</T>
                          </legend>
                          <input
                            className="govuk-input govuk-input--width-2"
                            id="frequency_value"
                            name="frequency_value"
                            type="text"
                            defaultValue={props.frequency_value}
                          />{' '}
                          <select
                            className="govuk-select govuk-!-display-inline"
                            id="frequency_unit"
                            name="frequency_unit"
                          >
                            <option value="">
                              {props.t(`publish.update_frequency.form.frequency_unit.options.select`)}
                            </option>
                            {props.unitOptions.map((unit) => (
                              <option key={unit} value={unit} selected={props.frequency_unit === unit}>
                                <T>publish.update_frequency.form.frequency_unit.options.{unit}</T>
                              </option>
                            ))}
                          </select>
                        </fieldset>
                      </div>
                    )
                  },
                  {
                    value: 'false',
                    label: <T>publish.update_frequency.form.is_updated.options.no.label</T>
                  }
                ]}
                value={props.is_updated}
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
