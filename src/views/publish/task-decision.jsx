import React from 'react';
import ErrorHandler from '../components/ErrorHandler';
import Layout from '../components/layouts/Publisher';
import clsx from 'clsx';

export default function TaskDecision(props) {
  return (
    <Layout>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form encType="multipart/form-data" method="post">
            <h1 className="govuk-heading-xl">{props.t(`publish.task.decision.${props.taskType}.heading`)}</h1>
            <ErrorHandler {...props} />

            <div
              className={clsx('govuk-form-group', {
                'govuk-form-group--error': props.errors?.find((e) => e.field === 'decision')
              })}
            >
              <fieldset className="govuk-fieldset">
                {props.errors?.find((e) => e.field === 'decision') && (
                  <p id="decision-error" className="govuk-error-message">
                    {props.t(`publish.task.decision.${props.taskType}.form.decision.error.missing`)}
                  </p>
                )}
                <div className="govuk-radios" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="decisionYes"
                      name="decision"
                      type="radio"
                      value="approve"
                      defaultChecked={props.values?.decision === 'approve'}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="decisionYes">
                      {props.t(`publish.task.decision.${props.taskType}.form.decision.options.yes.label`)}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="decisionNo"
                      name="decision"
                      data-aria-controls="conditional-decisionNo"
                      type="radio"
                      value="reject"
                      defaultChecked={props.values?.decision === 'reject'}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="decisionNo">
                      {props.t(`publish.task.decision.${props.taskType}.form.decision.options.no.label`)}
                    </label>
                  </div>
                  <div
                    className="govuk-radios__conditional govuk-radios__conditional--hidden"
                    id="conditional-decisionNo"
                  >
                    <div
                      className={clsx('govuk-form-group', {
                        'govuk-form-group--error': props.errors?.find((e) => e.field === 'reason')
                      })}
                    >
                      <fieldset className="govuk-fieldset" role="group" aria-describedby="decisionNo">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                          {props.t(`publish.task.decision.${props.taskType}.form.reason.label`)}
                        </legend>
                        {props.errors?.find((e) => e.field === 'reason') && (
                          <p id="reason-error" className="govuk-error-message">
                            {props.t(`publish.task.decision.${props.taskType}.form.reason.error.missing`)}
                          </p>
                        )}

                        <textarea
                          className="govuk-textarea"
                          id="roundingDescription"
                          name="reason"
                          rows="4"
                          aria-describedby="roundingDescription-hint"
                        >
                          {props.values?.reason}
                        </textarea>
                      </fieldset>
                    </div>
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
    </Layout>
  );
}
