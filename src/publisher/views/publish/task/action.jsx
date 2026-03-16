import React from 'react';
import ErrorHandler from '../../components/ErrorHandler';
import Layout from '../../components/Layout';
import { clsx } from 'clsx';
import T from '../../../../shared/views/components/T';
import ReplacementDatasetPicker from './ReplacementDatasetPicker';

export default function TaskAction(props) {
  const title = props.t(`publish.task.action.${props.action}.form.reason.label`);
  const isArchive = props.action === 'archive';

  return (
    <Layout {...props} formPage title={title}>
      {isArchive && <script src="/assets/js/accessible-autocomplete.min.js"></script>}

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

            {isArchive && props.availableDatasets?.length > 0 && (
              <ReplacementDatasetPicker
                errors={props.errors}
                values={props.values}
                availableDatasets={props.availableDatasets}
              />
            )}

            <button type="submit" className="govuk-button" data-module="govuk-button">
              <T>buttons.continue</T>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
