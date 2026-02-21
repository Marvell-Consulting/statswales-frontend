import React from 'react';
import { Filters } from '../../../../shared/views/components/filters';
import { PaginationProps } from '../../../../shared/views/components/Pagination';
import { NoteCodesLegendProps } from './NoteCodesLegend';
import { ViewTableProps } from './ViewTable';
import { useLocals } from '../../../../shared/views/context/Locals';
import { Filter } from '../../../../shared/interfaces/filter';
import { FilterTable } from '../../../../shared/dtos/filter-table';
import { DatasetDTO } from '../../../../shared/dtos/dataset';
import { SummaryTable } from './SummaryTable';
import T from '../../../../shared/views/components/T';
import TableChooser from './TableChooser';
import { PivotStage } from '../../../../shared/enums/pivot-stage';
import PivotSummary from './PivotSummary';
import ColumnRowChooser from './ColumnRowChooser';

type DataTabProps = NoteCodesLegendProps &
  PaginationProps &
  ViewTableProps & {
    url: string;
    dataset: DatasetDTO;
    filters: FilterTable[];
    selectedFilterOptions: Filter[];
    isDevPreview?: boolean;
    preview?: boolean;
    previewFailed?: string;
    isLanding: boolean;
    pivotStage: PivotStage;
    columns?: string;
    rows?: string;
  };

export default function LandingTab(props: DataTabProps) {
  const { buildUrl, i18n } = useLocals();

  let formUrl = buildUrl(`/${props.dataset.id}/filtered`, i18n.language);
  if (props.isDevPreview) formUrl = buildUrl(`/developer/${props.dataset.id}/filtered`, i18n.language, {}, 'data');
  else if (props.preview) formUrl = buildUrl(`/publish/${props.dataset.id}/cube-preview`, i18n.language);
  else if (props.columns && props.rows) formUrl = buildUrl(`/${props.dataset.id}/pivot`, i18n.language);

  let component = <TableChooser />;
  if (props.pivotStage) {
    switch (props.pivotStage) {
      case PivotStage.Columns:
      case PivotStage.Rows:
        component = <ColumnRowChooser {...props} />;
        break;
      case PivotStage.Summary:
        component = <PivotSummary {...props} />;
        break;
    }
  }

  return (
    <div className="govuk-width-container">
      <div className="govuk-main-wrapper govuk-!-padding-top-0">
        <div className="govuk-grid-row">
          {/* Sidebar filters */}
          <div className="govuk-grid-column-one-quarter">
            <form method="POST" action={formUrl}>
              <Filters
                dataset={props.dataset}
                preview={props.preview}
                filters={props.filters}
                url={props.url}
                title={props.t('consumer_view.filters')}
                selected={props.selectedFilterOptions}
                columns={props.columns}
                rows={props.rows}
              />
              <br />
              <button
                name="dataViewsChoice"
                value="filter"
                type="submit"
                className="govuk-button button-black"
                data-module="govuk-button"
              >
                <T>consumer_view.apply_filters</T>
              </button>
              {props.columns ? <input type="hidden" name="columns" value={props.columns} /> : null}
              {props.rows ? <input type="hidden" name="rows" value={props.rows} /> : null}
            </form>
          </div>

          {/* In developer view, if the preview has failed just hide the table and still render the rest of the page */}
          {props?.isDevPreview && props?.previewFailed ? (
            <div className="govuk-grid-column-three-quarters">
              <div className="govuk-error-summary" data-module="govuk-error-summary">
                <div role="alert">
                  <h2 className="govuk-error-summary__title">Cube preview failed to load</h2>
                  <p>{props.previewFailed}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="govuk-grid-column-three-quarters">
              {props.pivotStage === PivotStage.Summary ? null : <SummaryTable {...props} landing={true} />}
              {component}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
