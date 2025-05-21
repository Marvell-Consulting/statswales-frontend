import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';

export default function SelectGroup(props) {
  return (
    <Layout {...props} formPage>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{props.t('publish.group.heading')}</h1>

          <form encType="multipart/form-data" method="post">
            <ErrorHandler {...props} />

            <div
              className={clsx('govuk-form-group', {
                'govuk-form-group--error': props.errors?.find((e) => e.field === 'group_id')
              })}
            >
              <fieldset className="govuk-fieldset" aria-describedby="group_id">
                <div className="govuk-radios" data-module="govuk-radios">
                  {props.availableGroups?.map((group, index) => (
                    <div key={index} className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id={`group_${group.id}`}
                        name="group_id"
                        type="radio"
                        value={group.id}
                        defaultChecked={props.values.group_id === group.id}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor={`group_${group.id}`}>
                        {group.name}
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
    </Layout>
  );
}
