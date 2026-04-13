import React from 'react';
import { isValid, parse, parseISO } from 'date-fns';

import { useLocals } from '../../../../shared/views/context/Locals';
import Table from '../../../../shared/views/components/Table';
import { ColumnHeader } from '../../../../shared/dtos/view-dto';
import { FactTableColumnType } from '../../../../shared/dtos/fact-table-column-type';
import T from '../../../../shared/views/components/T';
import { dateFormat } from '../../../../shared/utils/date-format';
import NoteCodesLegend, { NoteCodesLegendProps } from './NoteCodesLegend';

export type ViewTableProps = NoteCodesLegendProps & {
  headers: ColumnHeader[];
  data: string[][];
  isFiltered?: boolean;
  isPivot?: boolean;
};

// Matches humanized numbers (commas as thousand separators), optional decimal,
// optional whitespace padding, and optional postfix codes like [x] or [z].
const isNumericValue = (value: string | undefined): boolean =>
  /^\s*-?(?:\d+|\d{1,3}(?:,\d{3})+)(\.\d+)?(\s*\[\w+\])*\s*$/.test(value ?? '');

export default function ViewTable(props: ViewTableProps) {
  const { i18n } = useLocals();

  // A column is numeric if it is typed as DataValues, or — for untyped/unknown columns
  // (e.g. pivoted columns whose headers come from dimension values) — if the first
  // non-empty cell in that column looks like a number.
  const isNumericColumn = (col: ColumnHeader, colIndex: number): boolean => {
    if (col.source_type === FactTableColumnType.DataValues) return true;
    if (col.source_type && col.source_type !== FactTableColumnType.Unknown) return false;
    const firstValue = props.data?.slice(0, 5).find((row) => row[colIndex])?.[colIndex];
    return firstValue !== undefined && isNumericValue(firstValue);
  };

  const columns = props.headers?.map((col, index) => ({
    key: index,
    label: col.name,
    format: (value: string) => {
      switch (true) {
        case col.source_type === FactTableColumnType.LineNumber:
          return <span className="linespan">{value}</span>;

        case col.source_type === FactTableColumnType.Time && typeof col.extractor?.dateFormat === 'string': {
          const parsedDate = parse(value, col.extractor.dateFormat, new Date());
          return isValid(parsedDate) ? dateFormat(parsedDate, 'do MMMM yyyy', { locale: i18n.language }) : value;
        }

        case col.name === i18n.t('consumer_view.start_date') || col.name === i18n.t('consumer_view.end_date'): {
          const parsedDate = parseISO(value.split('T')[0]);
          return isValid(parsedDate) ? dateFormat(parsedDate, 'do MMMM yyyy', { locale: i18n.language }) : value;
        }

        default:
          return value;
      }
    },
    className:
      col.source_type === FactTableColumnType.LineNumber
        ? 'line-number'
        : isNumericColumn(col, index)
          ? 'govuk-table__header--numeric'
          : '',
    cellClassName: (value: string) => {
      if (col.source_type === FactTableColumnType.LineNumber) return 'line-number';
      if (isNumericValue(value)) return 'govuk-table__cell--numeric';
      return undefined;
    }
  }));

  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <h2 className="govuk-heading-m">
            <T>consumer_view.data_table.heading</T>
          </h2>
        </div>
        <div className="govuk-grid-column-three-quarters table-actions">
          <div
            className="govuk-notification-banner govuk-notification-banner--success"
            id="copy-success"
            data-module="govuk-notification-banner"
            hidden
          >
            <div className="govuk-notification-banner__content">
              <T>consumer_view.data_table.copy_success</T>
            </div>
          </div>
          <button
            type="button"
            className="govuk-button govuk-button--tertiary govuk-button-small icon-copy"
            data-module="govuk-button"
            id="copy-link-button"
          >
            <T>consumer_view.data_table.buttons.copy_link</T>
          </button>
          <a
            href="#downloads"
            className="govuk-button govuk-button--tertiary govuk-button-small"
            id="download-table-button"
          >
            <T>consumer_view.data_table.buttons.download</T>
          </a>
        </div>
      </div>

      {!props.isPivot && props.isFiltered && (
        <div className="govuk-inset-text govuk-!-margin-top-2 govuk-!-margin-bottom-2 govuk-!-padding-3">
          <T>filters.active_filters_notice</T>
        </div>
      )}

      <NoteCodesLegend {...props} />

      {props.data?.length === 0 ? (
        <div className="govuk-inset-text">
          <T>consumer_view.no_data</T>
        </div>
      ) : (
        <Table isSticky columns={columns} rows={props.data} isSortable anchor="dataset-nav" />
      )}

      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
          (() => {
            const copyButton = document.getElementById('copy-link-button');
            const currentUrl = window.location.href;

            copyButton?.addEventListener('click', async () => {
              try {
                await navigator.clipboard.writeText(currentUrl);

                const successBanner = document.getElementById('copy-success');
                if (!successBanner) return;

                successBanner.hidden = false;
                setTimeout(() => {
                  successBanner.hidden = true;
                }, 10000);
              } catch (err) {
                // do nothing
              }
            });
          })();
          `
        }}
      />
    </>
  );
}
