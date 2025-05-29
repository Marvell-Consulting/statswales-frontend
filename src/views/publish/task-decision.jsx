import React from 'react';
import ErrorHandler from '../components/ErrorHandler';
import Layout from '../components/layouts/Publisher';
import clsx from 'clsx';
import RadioGroup from '../components/RadioGroup';
import T from '../components/T';

export default function TaskDecision(props) {
  const reasonError = props.errors?.find((e) => e.field === 'reason');

  return (
    <Layout {...props} formPage>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form encType="multipart/form-data" method="post">
            <h1 className="govuk-heading-xl govuk-!-margin-top-2" id="task-decision">
              <T>publish.task.decision.{props.taskType}.heading</T>
            </h1>

            <p className="govuk-body govuk-!-margin-0">
              <T title={props.title} raw>
                publish.task.decision.dataset_title
              </T>
            </p>

            <p className="govuk-body govuk-!-margin-0">
              <T publishAt={props.dateFormat(props.revision.publish_at, 'h:mmaaa, d MMMM yyyy')} raw>
                publish.overview.pending.publish_at
              </T>
            </p>

            <p className="govuk-body govuk-!-margin-top-0">
              <T userName={props.task.created_by_name} raw>
                publish.overview.pending.requested_by
              </T>
            </p>

            <ErrorHandler />

            <RadioGroup
              name="decision"
              labelledBy="task-decision"
              errorMessage={<T>publish.task.decision.{props.taskType}.form.decision.error.missing</T>}
              options={[
                {
                  value: 'approve',
                  label: <T>publish.task.decision.{props.taskType}.form.decision.options.yes.label</T>
                },
                {
                  value: 'reject',
                  label: <T>publish.task.decision.{props.taskType}.form.decision.options.no.label</T>,
                  children: (
                    <div
                      className={clsx('govuk-form-group', {
                        'govuk-form-group--error': props.errors?.find((e) => e.field === 'reason')
                      })}
                    >
                      <fieldset className="govuk-fieldset" role="group" aria-labelledby="decisionNo">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                          <T>publish.task.decision.{props.taskType}.form.reason.label</T>
                        </legend>
                        {reasonError && (
                          <p id="reason-error" className="govuk-error-message">
                            <T>publish.task.decision.{props.taskType}.form.reason.error.missing</T>
                          </p>
                        )}

                        <textarea
                          className="govuk-textarea"
                          id="roundingDescription"
                          name="reason"
                          rows="4"
                          aria-describedby="roundingDescription-hint"
                          defaultValue={props.values?.reason}
                        />
                      </fieldset>
                    </div>
                  )
                }
              ]}
              value={props.values?.decision}
            />

            <button type="submit" className="govuk-button" data-module="govuk-button">
              <T>buttons.continue</T>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
