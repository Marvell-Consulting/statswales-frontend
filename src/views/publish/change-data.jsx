import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function ChangeData(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.datasetId && props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl">{props.t('publish.change_data.title')}</h1>
      <ErrorHandler {...props} />

      <form encType="multipart/form-data" method="post">
        <div className="govuk-form-group">
          <fieldset className="govuk-fieldset" role="group">
            <div className="govuk-radios" data-module="govuk-radios">
              <div className="govuk-radios__item">
                <input className="govuk-radios__input" id="change-1" name="change" type="radio" value="table" />
                <label className="govuk-label govuk-radios__label" htmlFor="change-1">
                  {props.t('publish.change_data.change_table.label')}
                </label>
                <div
                  id="datatable-change-hint"
                  style={{ paddingTop: '10px', marginLeft: '-27px' }}
                  className="govuk-hint govuk-radios__hint"
                >
                  {props.t('publish.change_data.change_table.description')}
                </div>
              </div>
              <div className="govuk-radios__item">
                <input className="govuk-radios__input" id="change-2" name="change" type="radio" value="columns" />
                <label className="govuk-label govuk-radios__label" htmlFor="change-2">
                  {props.t('publish.change_data.change_columns.label')}
                </label>
                <div
                  id="datatable-change-hint"
                  style={{ paddingTop: '10px', marginLeft: '-27px' }}
                  className="govuk-hint govuk-radios__hint"
                >
                  {props.t('publish.change_data.change_columns.description')}
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="govuk-button-group">
          <button type="submit" className="govuk-button" data-module="govuk-button">
            {props.t('buttons.continue')}
          </button>
        </div>
      </form>
    </Layout>
  );
}
