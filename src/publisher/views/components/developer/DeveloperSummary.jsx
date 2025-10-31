import React from 'react';
import { dateFormat } from '../../../../shared/utils/date-format';

export default function DeveloperSummary(props) {
  return (
    <div className="govuk-accordion__section">
      <div className="govuk-accordion__section-header">
        <h2 className="govuk-accordion__section-heading">
          <span className="govuk-accordion__section-button" id="accordion-default-heading-1">
            {props.t('developer.display.summary')}
          </span>
        </h2>
      </div>
      <div id="accordion-default-content-1" className="govuk-accordion__section-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <table className="govuk-table">
              <tbody className="govuk-table__body">
                <tr>
                  <th scope="row" className="govuk-table__header">
                    {props.t('developer.display.title')}
                  </th>
                  <td className="govuk-table__cell">
                    {props.dataset?.revisions[0].metadata.title || `<${props.t('errors.name_missing')}>`}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="govuk-table__header">
                    {props.t('developer.display.id')}
                  </th>
                  <td className="govuk-table__cell">{props.dataset.id}</td>
                </tr>
                <tr>
                  <th scope="row" className="govuk-table__header">
                    {props.t('developer.display.created_by_id')}
                  </th>
                  <td className="govuk-table__cell">{props.dataset.created_by_id}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="govuk-grid-column-one-half">
            <table className="govuk-table">
              <tbody className="govuk-table__body">
                <tr>
                  <th scope="row" className="govuk-table__header">
                    {props.t('developer.display.created_at')}
                  </th>
                  <td className="govuk-table__cell">
                    {props.dataset.created_at &&
                      dateFormat(props.dataset.created_at, 'd MMMM yyyy h:mm a', { locale: props.i18n.language })}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="govuk-table__header">
                    {props.t('developer.display.live')}
                  </th>
                  <td className="govuk-table__cell">
                    {props.dataset.first_published_at &&
                      dateFormat(props.dataset.first_published_at, 'd MMMM yyyy h:mm a', {
                        locale: props.i18n.language
                      })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
