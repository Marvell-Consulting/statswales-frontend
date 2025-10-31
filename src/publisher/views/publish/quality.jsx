import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import { clsx } from 'clsx';
import RadioGroup from '../../../shared/views/components/RadioGroup';

export default function Quality(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);

  const title = props.t('publish.quality.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{title}</h1>

            <form encType="multipart/form-data" method="post">
              <ErrorHandler />

              <p className="govuk-body">{props.t('publish.quality.explain')}</p>

              <ul className="govuk-list govuk-list--bullet">
                <li>{props.t('publish.quality.explain_1')}</li>
                <li>{props.t('publish.quality.explain_2')}</li>
                <li>{props.t('publish.quality.explain_3')}</li>
                <li>{props.t('publish.quality.explain_4')}</li>
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

              <RadioGroup
                {...props}
                name="rounding_applied"
                label={props.t('publish.quality.form.rounding_applied.heading')}
                errorMessage={props.t('publish.quality.form.rounding_applied.error.missing')}
                options={[
                  {
                    value: 'true',
                    label: props.t('publish.quality.form.rounding_applied.options.yes.label'),
                    children: (
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
                    )
                  },
                  {
                    value: 'false',
                    label: props.t('publish.quality.form.rounding_applied.options.no.label')
                  }
                ]}
                value={
                  props.rounding_applied !== null &&
                  props.rounding_applied !== undefined &&
                  (props.rounding_applied ? 'true' : 'false')
                }
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
