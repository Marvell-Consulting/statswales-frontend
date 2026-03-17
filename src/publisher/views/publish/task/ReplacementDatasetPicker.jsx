import React from 'react';
import { clsx } from 'clsx';
import T from '../../../../shared/views/components/T';
import Autocomplete from '../../components/Autocomplete';

export default function ReplacementDatasetPicker(props) {
  return (
    <>
      <div
        className={clsx('govuk-form-group', {
          'govuk-form-group--error': props.errors?.find((e) => e.field === 'replacement_dataset_id')
        })}
      >
        {props.errors?.find((e) => e.field === 'replacement_dataset_id') && (
          <p id="replacement-dataset-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span>
            <T>publish.task.action.archive.form.replacement_dataset.error.missing_for_redirect</T>
          </p>
        )}
        <Autocomplete
          name="replacement_dataset_id"
          label={<T>publish.task.action.archive.form.replacement_dataset.label</T>}
          hint={<T>publish.task.action.archive.form.replacement_dataset.hint</T>}
          errorId={
            props.errors?.find((e) => e.field === 'replacement_dataset_id') ? 'replacement-dataset-error' : undefined
          }
          value={props.values?.replacement_dataset_id}
          options={[
            { value: '', label: '' },
            ...props.availableDatasets.map((d) => ({
              value: d.id,
              label: `${d.title} (${d.id})`
            }))
          ]}
        />
      </div>

      <div className="govuk-form-group">
        <div className="govuk-checkboxes" data-module="govuk-checkboxes">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="auto-redirect"
              name="auto_redirect"
              type="checkbox"
              value="true"
              defaultChecked={props.values?.auto_redirect === 'true' || props.values?.auto_redirect === true}
            />
            <label className="govuk-label govuk-checkboxes__label" htmlFor="auto-redirect">
              <T>publish.task.action.archive.form.auto_redirect.label</T>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
