import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';

export default function Quality(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{props.t('publish.quality.heading')}</h1>

            <form encType="multipart/form-data" method="post">
              <ErrorHandler {...props} />

              <p className="govuk-body">{props.t('publish.quality.explain')}</p>

              <ul className="govuk-list govuk-list--bullet">
                <li>{props.t('publish.quality.explain_1')}</li>
                <ul className="govuk-list govuk-list--bullet">
                  <li>{props.t('publish.quality.explain_1a')}</li>
                  <li>{props.t('publish.quality.explain_1b')}</li>
                </ul>
                <li>{props.t('publish.quality.explain_2')}</li>
              </ul>

              <div className="govuk-form-group">
                <div className="govuk-hint">{props.t('publish.quality.language')}</div>
                {props.errors?.find((e) => e.field === 'quality') && (
                  <p id="quality-error" className="govuk-error-message">
                    {props.t('publish.quality.form.quality.error.missing')}
                  </p>
                )}

                <textarea
                  className={clsx('govuk-textarea', {
                    'govuk-textarea--error': props.errors?.find((e) => e.field === 'quality')
                  })}
                  id="quality"
                  name="quality"
                  rows="15"
                  defaultValue={props.quality}
                />
              </div>

              <div
                className={clsx('govuk-form-group', {
                  'govuk-form-group--error': props.errors?.find((e) => e.field === 'rounding_applied')
                })}
              >
                <fieldset className="govuk-fieldset" aria-describedby="rounding">
                  <h2 className="govuk-heading-s">{props.t('publish.quality.form.rounding_applied.heading')}</h2>
                  {props.errors?.find((e) => e.field === 'rounding_applied') && (
                    <p id="rounding_applied-error" className="govuk-error-message">
                      {props.t('publish.quality.form.rounding_applied.error.missing')}
                    </p>
                  )}

                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="roundingApplied1"
                        name="rounding_applied"
                        data-aria-controls="conditional-rounding1"
                        type="radio"
                        value="true"
                        defaultChecked={props.rounding_applied}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="roundingApplied1">
                        {props.t('publish.quality.form.rounding_applied.options.yes.label')}
                      </label>
                    </div>
                    <div
                      className="govuk-radios__conditional govuk-radios__conditional--hidden"
                      id="conditional-rounding1"
                    >
                      <div
                        className={clsx('govuk-form-group', {
                          'govuk-form-group--error': props.errors?.find((e) => e.field === 'rounding_description')
                        })}
                      >
                        <fieldset className="govuk-fieldset" role="group" aria-describedby="roundingApplied1">
                          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                            {props.t('publish.quality.form.rounding_description.label')}
                          </legend>
                          <div className="govuk-hint">{props.t('publish.quality.language')}</div>
                          {props.errors?.find((e) => e.field === 'rounding_description') && (
                            <p id="rounding_description-error" className="govuk-error-message">
                              {props.t('publish.quality.form.rounding_description.error.missing')}
                            </p>
                          )}

                          <textarea
                            className="govuk-textarea"
                            id="roundingDescription"
                            name="rounding_description"
                            rows="4"
                            aria-describedby="roundingDescription-hint"
                            defaultValue={props.rounding_description}
                          />
                        </fieldset>
                      </div>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="roundingApplied2"
                        name="rounding_applied"
                        type="radio"
                        value="false"
                        defaultChecked={props.rounding_applied || undefined}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="roundingApplied2">
                        {props.t('publish.quality.form.rounding_applied.options.no.label')}
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
