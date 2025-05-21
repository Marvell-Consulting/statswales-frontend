import React from 'react';
import Table from '../Table';

export default function Measure(props) {
  return (
    <div className="govuk-accordion__section">
      <div className="govuk-accordion__section-header">
        <h2 className="govuk-accordion__section-heading">
          <span className="govuk-accordion__section-button" id="accordion-default-heading-3">
            {props.t('developer.display.measure')}
          </span>
        </h2>
      </div>
      <div id="accordion-default-content-3" className="govuk-accordion__section-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <p className="govuk-body-m"></p>
            <Table
              {...props}
              i18nBase="developer.display"
              columns={['id', 'fact_table_column', 'join_column']}
              rows={[props.dataset?.measure]}
            />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-full">
            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">{props.t('developer.display.show_measure_table')}</span>
              </summary>
              <Table
                {...props}
                i18nBase="developer.display"
                columns={['reference', 'format', 'decimals', 'description', 'notes', 'sort_order', 'hierarchy']}
                rows={props.dataset.measure.measure_table}
              />
            </details>
          </div>
        </div>
        {props.dataset?.measure && props.dataset?.measure.lookup_table && (
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-full">
              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    {props.t('developer.display.show_lookup_table_details')}
                  </span>
                </summary>
                <Table
                  {...props}
                  inverted
                  i18nBase="developer.display"
                  columns={[
                    'id',
                    'mime_type',
                    'file_type',
                    'filename',
                    'hash',
                    {
                      key: 'uploaded_at',
                      format: (value) =>
                        props.dateFormat(value, 'd MMMM yyyy h:mm a', {
                          locale: props.i18n.language
                        })
                    },
                    'download'
                  ]}
                  rows={[props.dataset?.measure.lookup_table]}
                />
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
