import React from 'react';
import { Filters } from '../../../../shared/views/components/filters';
import Pagination, { PaginationProps } from '../../../../shared/views/components/Pagination';
import { NoteCodesLegendProps } from './NoteCodesLegend';
import ViewTable, { ViewTableProps } from './ViewTable';
import { useLocals } from '../../../../shared/views/context/Locals';
import { Filter } from '../../../../shared/interfaces/filter';
import { FilterTable } from '../../../../shared/dtos/filter-table';
import { DatasetDTO } from '../../../../shared/dtos/dataset';
import { SummaryTable } from './SummaryTable';
import { RowsPerPage } from '../../../../shared/views/components/RowsPerPage';
import { SortByInterface, serializeSortBy } from '../../../../shared/interfaces/sort-by';
import { PivotControls } from './pivot/PivotControls';
import { DataControls } from './pivot/DataControls';
import { isFeatureEnabled } from '../../../../shared/utils/feature-flags';
import { FeatureFlag } from '../../../../shared/enums/feature-flag';

type DataTabProps = NoteCodesLegendProps &
  PaginationProps &
  ViewTableProps & {
    url: string;
    dataset: DatasetDTO;
    filters: FilterTable[];
    selectedFilterOptions: Filter[];
    page_size: number;
    sortBy?: SortByInterface;
    isDevPreview?: boolean;
    preview?: boolean;
    previewFailed?: string;
    filterId: string;
    columns?: string;
    rows?: string;
  };

export default function DataTab(props: DataTabProps) {
  const { buildUrl, i18n, protocol, hostname, url, featureFlags } = useLocals();
  const urlObj = new URL(url, `${protocol}://${hostname}`);
  const showPivot = isFeatureEnabled(urlObj.searchParams, FeatureFlag.PivotFlow, featureFlags);
  const pivotSelected = !!props.columns && !!props.rows;

  let formUrl = buildUrl(`/${props.dataset.id}/filtered`, i18n.language);
  if (props.isDevPreview) formUrl = buildUrl(`/developer/${props.dataset.id}/filtered`, i18n.language, {}, 'data');
  else if (props.preview) formUrl = buildUrl(`/publish/${props.dataset.id}/cube-preview`, i18n.language);
  else if (props.columns && props.rows) formUrl = buildUrl(`/${props.dataset.id}/pivot`, i18n.language);
  return (
    <div className="govuk-width-container">
      <div className="govuk-main-wrapper govuk-!-padding-top-0">
        <div className="govuk-grid-row">
          {/* Sidebar filters */}
          <div className="govuk-grid-column-one-quarter">
            <form method="POST" action={formUrl}>
              <input type="hidden" name="page_size" value={props.page_size} />
              {props.sortBy && <input type="hidden" name="sort_by" value={serializeSortBy(props.sortBy)} />}

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
              <SummaryTable {...props} showAccordion={true} />

              {!props.preview &&
                !props.isDevPreview &&
                showPivot &&
                (pivotSelected ? <PivotControls {...props} /> : <DataControls {...props} />)}

              <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
                <ViewTable {...props} isFiltered={props.selectedFilterOptions?.length > 0} isPivot={pivotSelected} />
              </div>
              <Pagination {...props} />
              <RowsPerPage pageSize={props.page_size} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
