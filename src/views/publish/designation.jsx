import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';

export default function Designation(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="form-background">
        <div className="govuk-width-container app-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <div className="govuk-width-container">
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                  <h1 className="govuk-heading-xl">{props.t('publish.designation.heading')}</h1>

                  <form encType="multipart/form-data" method="post">
                    <ErrorHandler {...props} />

                    <div
                      className={clsx('govuk-form-group', {
                        'govuk-form-group--error': props.errors?.find((e) => e.field === 'designation')
                      })}
                    >
                      <fieldset className="govuk-fieldset" aria-describedby="designation">
                        <div className="govuk-radios" data-module="govuk-radios">
                          {props.designationOptions.map((option) => (
                            <div className="govuk-radios__item" key={option}>
                              <input
                                className="govuk-radios__input"
                                id={`designation_${option}`}
                                name="designation"
                                type="radio"
                                value={option}
                                defaultChecked={props.designation === option}
                              />
                              <label className="govuk-label govuk-radios__label" htmlFor={`designation_${option}`}>
                                {props.t(`publish.designation.form.designation.options.${option}.label`)}
                              </label>
                            </div>
                          ))}
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
          </main>
        </div>
      </div>
    </Layout>
  );
}
