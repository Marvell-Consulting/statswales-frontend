import React from 'react';
import ErrorHandler from '../../components/ErrorHandler';
import Layout from '../../components/Layout';
import clsx from 'clsx';
import T from '../../../../shared/views/components/T';

export default function TaskAction(props) {
  const reasonError = props.errors?.find((e) => e.field === 'reason');
  const title = props.t(`publish.task.action.${props.action}.form.reason.label`);

  return (
    <Layout {...props} formPage title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form encType="multipart/form-data" method="post">
            <ErrorHandler />

            <div
              className={clsx('govuk-form-group', {
                'govuk-form-group--error': props.errors?.find((e) => e.field === 'reason')
              })}
            >
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                  <h1 className="govuk-fieldset__heading">
                    <T>publish.task.action.{props.action}.form.reason.label</T>
                  </h1>
                </legend>

                <textarea
                  className="govuk-textarea"
                  id="task-action-reason"
                  name="reason"
                  rows="4"
                  defaultValue={props.values?.reason}
                />
              </fieldset>
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
