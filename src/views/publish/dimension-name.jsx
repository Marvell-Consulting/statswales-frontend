import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function DimensionName(props) {
  function getBackLink() {
    if (props.revisit) {
      if (props.dimensionType === 'measure') {
        return props.buildUrl(`/publish/${props.datasetId}/measure`, props.i18n.language);
      } else {
        return props.buildUrl(`/publish/${props.datasetId}/dimension/${props.id}`, props.i18n.language);
      }
    } else {
      switch (props.dimensionType) {
        case 'measure':
          return props.buildUrl(`/publish/${props.datasetId}/measure/review`, props.i18n.language);
        case 'date_period':
        case 'date':
          return props.buildUrl(`/publish/${props.datasetId}/dates/${props.id}/review`, props.i18n.language);
        default:
          return props.buildUrl(`/publish/${props.datasetId}/lookup/${props.id}/review`, props.i18n.language);
      }
    }
  }
  const backLink = getBackLink();
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <p className="govuk-body-l region-subhead govuk-!-font-weight-bold">{props.columnName}</p>
      <h1 className="govuk-heading-xl">
        {props.dimensionType === 'measure'
          ? props.t('publish.dimension_name.measure_heading')
          : props.t('publish.dimension_name.dimension_heading')}
      </h1>

      <ErrorHandler />

      <p className="govuk-body">{props.t('publish.dimension_name.hint')}</p>
      <ul className="govuk-list govuk-list--bullet">
        <li>{props.t('publish.dimension_name.concise')}</li>
        <li>{props.t('publish.dimension_name.unique')}</li>
        <li>{props.t('publish.dimension_name.language')}</li>
      </ul>
      <form encType="multipart/form-data" method="post">
        <div className="govuk-form-group">
          <input className="govuk-input" id="name" name="name" type="text" defaultValue={props.dimensionName} />
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
