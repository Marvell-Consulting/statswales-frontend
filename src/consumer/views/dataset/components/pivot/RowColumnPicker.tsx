import React from 'react';
import { FilterTable } from '../../../../../shared/dtos/filter-table';

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
      <div key={`RowColumnPicker-${idx}`} className="govuk-radios__item">
        <input
          className="govuk-radios__input"
          id={`pivot_${f.factTableColumn}`}
          name={props.type}
          type="radio"
          value={f.factTableColumn}
          required={true}
        />
        <label className="govuk-label govuk-radios__label" htmlFor={`pivot_${f.factTableColumn}`}>
          {f.columnName}
        </label>
      </div>
    );
  });
  return (
    <div className="govuk-radios" data-module="govuk-radios">
      {radios}
    </div>
  );
}
