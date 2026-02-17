import React from 'react';
import T from '../../../../shared/views/components/T';
import { DatasetDTO } from '../../../../shared/dtos/dataset';
import { FilterTable } from '../../../../shared/dtos/filter-table';
import { Filter } from '../../../../shared/interfaces/filter';
import { PivotStage } from '../../../controllers/pivot-stage';
import RowColumnPicker from './pivot/RowColumnPicker';

interface ColumnProps {
  url: string;
  dataset: DatasetDTO;
  filters: FilterTable[];
  selectedFilterOptions: Filter[];
  pivotStage: PivotStage;
  columns?: string;
  rows?: string;
}

export default function ColumnRowChooser(props: ColumnProps) {
  let type = 'column';
  switch (props.pivotStage) {
    case PivotStage.Columns:
      type = 'columns';
      break;
    case PivotStage.Rows:
      type = 'rows';
      break;
  }
  const columnProps = {
    filters: props.filters,
    columns: props.columns,
    rows: props.rows,
    type
  };
  return (
    <form method="GET">
      <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
        <div className="govuk-form-group">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
              <h2 className="govuk-heading-m">
                <T>{type}_chooser.heading</T>
              </h2>
              <p className="govuk-body">
                <T>{type}_chooser.intro</T>
              </p>
            </legend>
            <RowColumnPicker {...columnProps} />
          </fieldset>
          {props.columns ? <input type="hidden" name="columns" value={props.columns} /> : null}
          {props.rows ? <input type="hidden" name="rows" value={props.rows} /> : null}
          <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
            <button type="submit" className="govuk-button" data-module="govuk-button">
              <T>buttons.continue</T>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
