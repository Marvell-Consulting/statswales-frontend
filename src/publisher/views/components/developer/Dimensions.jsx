import React, { Fragment } from 'react';

export default function Dimensions(props) {
  return (
    <div className="govuk-accordion__section">
      <div className="govuk-accordion__section-header">
        <h2 className="govuk-accordion__section-heading">
          <span className="govuk-accordion__section-button" id="accordion-default-heading-4">
            {props.t('developer.display.dimension')}
          </span>
        </h2>
      </div>
      <div id="accordion-default-content-4" className="govuk-accordion__section-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <table className="govuk-table dimension-table">
              <thead>
                <tr>
                  <th scope="col" className="govuk-table__header">
                    {props.t('developer.display.id')}
                  </th>
                  <th scope="col" className="govuk-table__header">
                    {props.t('developer.display.type')}
                  </th>
                  <th scope="col" className="govuk-table__header">
                    {props.t('developer.display.fact_table_column')}
                  </th>
                  <th scope="col" className="govuk-table__header">
                    {props.t('developer.display.join_column')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {props.dataset?.dimensions?.map((dim, index) => (
                  <Fragment key={index}>
                    <tr>
                      <td className="govuk-table__cell" rowSpan="2">
                        {dim.id}
                      </td>
                      <td className="govuk-table__cell">{dim.type}</td>
                      <td className="govuk-table__cell">{dim.factTableColumn}</td>
                      <td className="govuk-table__cell">{dim.joinColumn}</td>
                      <td className="govuk-table__cell"></td>
                    </tr>
                    <tr>
                      <th className="govuk-table__cell" scope="row">
                        {props.t('developer.display.extractor')}
                      </th>
                      <td colSpan="2" className="govuk-table__cell">
                        <details className="govuk-details" data-module="govuk-details">
                          <summary className="govuk-details__summary">
                            <span className="govuk-details__summary-text">
                              {props.t('developer.display.show_extractor')}
                            </span>
                          </summary>
                          <pre>
                            <code>{JSON.stringify(dim.extractor, null, 2)}</code>
                          </pre>
                        </details>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-full">
            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">{props.t('developer.display.show_metadata')}</span>
              </summary>
              <table className="govuk-table dimension-table">
                <thead>
                  <tr>
                    <th scope="col" className="govuk-table__header">
                      {props.t('developer.display.id')}
                    </th>
                    <th scope="col" className="govuk-table__header">
                      {props.t('developer.display.fact_table_column')}
                    </th>
                    <th scope="col" className="govuk-table__header">
                      {props.t('developer.display.name')}
                    </th>
                    <th scope="col" className="govuk-table__header">
                      {props.t('developer.display.description')}
                    </th>
                    <th scope="col" className="govuk-table__header">
                      {props.t('developer.display.notes')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {props.dataset?.dimensions?.map((dim) => (
                    <tr key={dim.id}>
                      <td className="govuk-table__cell">{dim.id}</td>
                      <td className="govuk-table__cell">{dim.factTableColumn}</td>
                      <td className="govuk-table__cell">{dim.metadata.name}</td>
                      <td className="govuk-table__cell">{dim.metadata.description}</td>
                      <td className="govuk-table__cell">{dim.metadata.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          .dimension-table td {
            padding-top: 10px;
            padding-bottom: 10px;
          }

          .dimension-table details {
            border: none !important;
            padding: 0 !important;
          }`
          }}
        />
      </div>
    </div>
  );
}
