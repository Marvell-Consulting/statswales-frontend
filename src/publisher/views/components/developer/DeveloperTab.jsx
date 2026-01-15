import React from 'react';
import DeveloperSummary from './DeveloperSummary';
import FactTable from './FactTable';
import Measure from './Measure';
import Dimensions from './Dimensions';
import Revisions from './Revisions';
import Files from './Files';
import Json from './Json';

export default function DeveloperTab(props) {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
          <DeveloperSummary {...props} />
          {props.dataset?.fact_table?.length > 0 && <FactTable {...props} />}
          {props.dataset?.measure && <Measure {...props} />}
          {props.dataset?.dimensions?.length > 0 && <Dimensions {...props} />}
          {props.dataset?.revisions?.length > 0 && <Revisions {...props} />}
          <Files {...props} />
          <Json {...props} />
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .wg .govuk-accordion__section {
            background-color: #ffffff;
          }`
        }}
      />
    </div>
  );
}
