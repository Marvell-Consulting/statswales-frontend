import qs from 'qs';
import React from 'react';
import { Filters } from '../../../../shared/views/components/Filters';
import Pagination, { PaginationProps } from '../../../../shared/views/components/Pagination';
import { NoteCodesLegendProps } from './NoteCodesLegend';
import ViewTable, { ViewTableProps } from './ViewTable';
import { useLocals } from '../../../../shared/views/context/Locals';
import { Filter } from '../../../../shared/interfaces/filter';
import { FilterTable } from '../../../../shared/dtos/filter-table';
import { DatasetDTO } from '../../../../shared/dtos/dataset';
import { SummaryTable } from './SummaryTable';
import T from '../../../../shared/views/components/T';
import TableChooser from './TableChooser';

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
    landing: boolean;
  };

export default function LandingTab(props: DataTabProps) {
  const { buildUrl, i18n } = useLocals();
  const [_originalUrl] = props.url.split('?');

  const formUrl = props.isDevPreview
    ? buildUrl(`/developer/${props.dataset.id}/filtered`, i18n.language, {}, 'data')
    : props.preview
      ? buildUrl(`/publish/${props.dataset.id}/cube-preview`, i18n.language)
      : buildUrl(`/${props.dataset.id}/filtered`, i18n.language);
  const summaryProps = {
    ...props,
    landing: true
  };
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
              <SummaryTable {...summaryProps} />
              <TableChooser />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
