import React from 'react';
import T from '../../../../shared/views/components/T';
import { DatasetDTO } from '../../../../shared/dtos/dataset';
import { FilterTable } from '../../../../shared/dtos/filter-table';
import { Filter } from '../../../../shared/interfaces/filter';
import { PivotStage } from '../../../controllers/pivot-stage';
import { SummaryTable } from './SummaryTable';
import { flattenReferences } from './summary/SummaryTableRow';

interface PivotProps {
  url: string;
  dataset: DatasetDTO;
  filters: FilterTable[];
  selectedFilterOptions: Filter[];
  pivotStage: PivotStage;
  columns?: string;
  rows?: string;
}

export default function PivotSummary(props: PivotProps) {
  const filterInputValues = props.filters
    .filter((f) => {
      if (f.factTableColumn === props.columns) {
        return false;
      }
      return f.factTableColumn !== props.rows;
    })
    .filter((f) => f.values.length > 0)
    .map((f) => {
      const value = flattenReferences(f.values)[0];
      return (
        <input
          key={`input-${f.factTableColumn}`}
          type="hidden"
          name={`filter[${f.factTableColumn}]`}
          value={value.reference}
        />
      );
    });

  return (
    <form method="POST">
      <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
        <div className="govuk-form-group">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
              <h2 className="govuk-heading-m">
                <T>pivot_summary.heading</T>
              </h2>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <T>pivot_summary.intro-1</T>
                </li>
                <li>
                  <T>pivot_summary.intro-2</T>
                </li>
              </ul>
            </legend>
            <SummaryTable {...props} />
          </fieldset>
          <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
            <input type="hidden" name="columns" value={props.columns} />
            <input type="hidden" name="rows" value={props.rows} />
            {filterInputValues}
            <button type="submit" className="govuk-button" data-module="govuk-button">
              <T>buttons.create_table</T>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
