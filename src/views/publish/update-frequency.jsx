import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';

export default function UpdateFrequency(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{props.t('publish.update_frequency.heading')}</h1>

            <form encType="multipart/form-data" method="post">
              <ErrorHandler {...props} />

              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset" aria-describedby="rounding">
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="isUpdatedYes"
                        name="is_updated"
                        data-aria-controls="conditional-isUpdated1"
                        type="radio"
                        value="true"
                        defaultChecked={props.is_updated === true}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="isUpdatedYes">
                        {props.t('publish.update_frequency.form.is_updated.options.yes.label')}
                      </label>
                    </div>
                    <div
                      className="govuk-radios__conditional govuk-radios__conditional--hidden"
                      id="conditional-isUpdated1"
                    >
                      <div
                        className={clsx('govuk-form-group', {
                          'govuk-form-group--error': props.errors?.find((e) =>
                            ['frequency_unit', 'frequency_value'].includes(e.field)
                          )
                        })}
                      >
                        <fieldset className="govuk-fieldset" role="group" aria-describedby="isUpdatedYes">
                          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                            {props.t('publish.update_frequency.form.frequency_value.label')}
                          </legend>
                          <input
                            className="govuk-input govuk-input--width-2"
                            id="frequency_value"
                            name="frequency_value"
                            type="text"
                            value={props.frequency_value}
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
                                {props.t(`publish.update_frequency.form.frequency_unit.options.${unit}`)}
                              </option>
                            ))}
                          </select>
                        </fieldset>
                      </div>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="isUpdatedNo"
                        name="is_updated"
                        type="radio"
                        value="false"
                        defaultChecked={props.is_updated === false}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="isUpdatedNo">
                        {props.t('publish.update_frequency.form.is_updated.options.no.label')}
                      </label>
                    </div>
                  </div>
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
