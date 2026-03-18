import React from 'react';
import { FilterTable } from '../../../../../shared/dtos/filter-table';
import T from '../../../../../shared/views/components/T';

interface FilterProps {
  filters: FilterTable[];
  type: string;
  columns?: string;
  rows?: string;
}

export default function RowColumnPicker(props: FilterProps) {
  const cleanedFilters = props.filters.filter((f) => {
    if (f.factTableColumn === props.columns) return false;
    return f.factTableColumn !== props.rows;
  });
  const radios = cleanedFilters.map((f: FilterTable, idx: number) => {
    return (
      <div key={`RowColumnPicker-${idx}`} id="row-column-chooser" className="govuk-radios__item">
        <input
          className="govuk-radios__input"
          id={`pivot_${f.factTableColumn.replaceAll(/\s+/g, '_')}`}
          name={props.type}
          type="radio"
          value={f.factTableColumn}
          required={true}
        />
        <label
          className="govuk-label govuk-radios__label"
          htmlFor={`pivot_${f.factTableColumn.replaceAll(/\s+/g, '_')}`}
        >
          {f.columnName}
        </label>
        <div className="govuk-hint govuk-radios__hint">
          <a href={`#filter-${f.factTableColumn.replaceAll(/\s+/g, '_')}`}>
            <T>columns_chooser.see_values</T>
          </a>
        </div>
      </div>
    );
  });
  return (
    <div className="govuk-radios" data-module="govuk-radios">
      {radios}
    </div>
  );
}
