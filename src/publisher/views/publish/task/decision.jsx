import React from 'react';
import ErrorHandler from '../../components/ErrorHandler';
import Layout from '../../components/Layout';
import { clsx } from 'clsx';
import RadioGroup from '../../../../shared/views/components/RadioGroup';
import T from '../../../../shared/views/components/T';
import { dateFormat } from '../../../../shared/utils/date-format';

export default function TaskDecision(props) {
  const reasonError = props.errors?.find((e) => e.field === 'reason');
  const title = props.t(`publish.task.decision.${props.taskType}.heading`);

  return (
    <Layout {...props} formPage title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form encType="multipart/form-data" method="post">
            <h1 className="govuk-heading-xl govuk-!-margin-top-2" id="task-decision">
              {title}
            </h1>

            <p className="govuk-body govuk-!-margin-0">
              <T title={props.title} raw>
                publish.task.decision.dataset_title
              </T>
            </p>

            {props.taskType === 'publish' && (
              <p className="govuk-body govuk-!-margin-0">
                <T
                  publishAt={dateFormat(props.revision.publish_at, 'h:mmaaa, d MMMM yyyy', {
                    locale: props.i18n.language
                  })}
                  raw
                >
                  {`publish.overview.${props.task.action}.requested.publish_at`}
                </T>
              </p>
            )}

            <p className="govuk-body govuk-!-margin-0">
              <T userName={props.task.created_by_name} raw>
                {`publish.overview.${props.task.action}.requested.requested_by`}
              </T>
            </p>

            {props.task?.metadata?.replacementDatasetTitle && (
              <p className="govuk-body govuk-!-margin-0">
                <T
                  title={props.task.metadata.replacementDatasetTitle}
                  url={props.buildUrl(
                    `/publish/${props.task.metadata.replacementDatasetId}/overview`,
                    props.i18n.language
                  )}
                  raw
                >
                  publish.overview.archive.requested.replacement_dataset
                </T>
              </p>
            )}

            {props.task?.metadata?.autoRedirect && (
              <p className="govuk-body govuk-!-margin-top-0">
                <T>publish.overview.archive.requested.auto_redirect</T>
              </p>
            )}

            <div className="govuk-!-margin-top-4">
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
            </div>

            <button type="submit" className="govuk-button" data-module="govuk-button">
              <T>buttons.continue</T>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
