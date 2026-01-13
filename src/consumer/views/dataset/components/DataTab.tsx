import qs from 'qs';
import React from 'react';
import { Filters } from '../../../../shared/views/components/Filters';
import Pagination, { PaginationProps } from '../../../../shared/views/components/Pagination';
import NoteCodesLegend, { NoteCodesLegendProps } from './NoteCodesLegend';
import ViewTable, { ViewTableProps } from './ViewTable';
import { useLocals } from '../../../../shared/views/context/Locals';
import { Filter } from '../../../../shared/interfaces/filter';
import { FilterTable } from '../../../../shared/dtos/filter-table';
import { DatasetDTO } from '../../../../shared/dtos/dataset';

type DataTabProps = NoteCodesLegendProps &
  PaginationProps &
  ViewTableProps & {
    url: string;
    dataset: DatasetDTO;
    filters: FilterTable[];
    selectedFilterOptions: Filter[];
    page_size: number;
    isDeveloper?: boolean;
    preview?: boolean;
    previewFailed?: string;
  };

export default function DataTab(props: DataTabProps) {
  const { buildUrl, i18n } = useLocals();
  const [_originalUrl, query] = props.url.split('?');
  const parsedQuery = qs.parse(query);
  const sortBy = parsedQuery.sort_by as { columnName: string; direction: string } | undefined;

  const formUrl = props.preview
    ? buildUrl(`/publish/${props.dataset.id}/cube-preview`, i18n.language)
    : buildUrl(`/${props.dataset.id}/filtered`, i18n.language);

  return (
    <div className="govuk-width-container">
      <div className="govuk-main-wrapper govuk-!-padding-top-0">
        <NoteCodesLegend {...props} />
        <div className="govuk-grid-row border-top-small">
          {/* Sidebar filters */}
          <div className="govuk-grid-column-one-quarter">
            <form method="POST" action={formUrl}>
              <h2 className="govuk-heading-m">{props.t('consumer_view.options')}</h2>
              <div className="govuk-form-group">
                <label className="govuk-label region-subhead" htmlFor="page_size">
                  {props.t('consumer_view.page_size')}
                </label>
                <select
                  className="govuk-select full-width"
                  id="page_size"
                  name="page_size"
                  defaultValue={props.page_size}
                  autoComplete="on"
                >
                  {[5, 10, 25, 50, 100, 250, 500].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              {sortBy && (
                <>
                  <input type="hidden" name="sort_by[columnName]" value={sortBy.columnName} />
                  <input type="hidden" name="sort_by[direction]" value={sortBy.direction} />
                </>
              )}

              <Filters
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
                {props.t('consumer_view.apply_filters')}
              </button>
            </form>
          </div>

          {/* In developer view, if the preview has failed just hide the table and still render the rest of the page */}
          {props?.isDeveloper && props?.previewFailed ? (
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
              <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
                <ViewTable {...props} />
              </div>
              <Pagination {...props} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
