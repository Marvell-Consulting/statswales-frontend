import React from 'react';
import DatasetStatus from '../components/dataset/DatasetStatus';
import ErrorHandler from '../components/ErrorHandler';
import Layout from '../components/layouts/Publisher';
import clsx from 'clsx';
import RadioGroup from '../components/RadioGroup';
import T from '../components/T';

export default function TaskDecision(props) {
  const reasonError = props.errors?.find((e) => e.field === 'reason');

  return (
    <Layout {...props}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form encType="multipart/form-data" method="post">

            <h1 className="govuk-heading-xl govuk-!-margin-top-2" id="task-decision">
              {props.t(`publish.task.decision.${props.taskType}.heading`)}
            </h1>

            <p className="govuk-body govuk-!-margin-0">Dataset title: <strong>{props.title}</strong></p>

            <p
              className="govuk-body govuk-!-margin-0"
              dangerouslySetInnerHTML={{
                __html: props.t('publish.overview.pending.publish_at', {
                  publishAt: props.dateFormat(props.revision.publish_at, 'h:mmaaa, d MMMM yyyy')
                })
              }}
            />
            <p
              className="govuk-body govuk-!-margin-top-0"
              dangerouslySetInnerHTML={{
                __html: props.t('publish.overview.pending.requested_by', {
                  userName: props.task.created_by_name
                })
              }}
            />

            <ErrorHandler {...props} />

            <RadioGroup
              name="decision"
              labelledBy="task-decision"
              errorMessage={props.t(`publish.task.decision.${props.taskType}.form.decision.error.missing`)}
              options={[
                {
                  value: 'approve',
                  label: props.t(`publish.task.decision.${props.taskType}.form.decision.options.yes.label`)
                },
                {
                  value: 'reject',
                  label: props.t(`publish.task.decision.${props.taskType}.form.decision.options.no.label`),
                  children: (
                    <div
                      className={clsx('govuk-form-group', {
                        'govuk-form-group--error': props.errors?.find((e) => e.field === 'reason')
                      })}
                    >
                      <fieldset className="govuk-fieldset" role="group" aria-labelledby="decisionNo">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                          {props.t(`publish.task.decision.${props.taskType}.form.reason.label`)}
                        </legend>
                        {reasonError && (
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
