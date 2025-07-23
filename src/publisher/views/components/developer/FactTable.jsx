import React from 'react';
import Table from '../../../../shared/views/components/Table';

export default function FactTable(props) {
  return (
    <div className="govuk-accordion__section">
      <div className="govuk-accordion__section-header">
        <h2 className="govuk-accordion__section-heading">
          <span className="govuk-accordion__section-button" id="accordion-default-heading-2">
            {props.t('developer.display.fact_table')}
          </span>
        </h2>
      </div>
      <div id="accordion-default-content-2" className="govuk-accordion__section-content">
        <Table
          i18nBase="developer.display"
          columns={['name', 'index', 'type', 'datatype']}
          rows={props.dataset?.fact_table.map((row) => ({ ...row, data_type: row.datatype }))}
        />
      </div>
    </div>
  );
}
