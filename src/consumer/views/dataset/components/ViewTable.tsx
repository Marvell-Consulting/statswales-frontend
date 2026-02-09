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
};

export default function ViewTable(props: ViewTableProps) {
  const { i18n } = useLocals();

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

        case col.name === i18n.t('consumer_view.start_data') || col.name === i18n.t('consumer_view.end_data'): {
          const parsedDate = parseISO(value.split('T')[0]);
          return dateFormat(parsedDate, 'do MMMM yyyy', { locale: i18n.language });
        }

        default:
          return value;
      }
    },
    className: col.source_type === FactTableColumnType.LineNumber ? 'line-number' : '',
    cellClassName: col.source_type === FactTableColumnType.LineNumber ? 'line-number' : ''
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
          <div className="govuk-notification-banner govuk-notification-banner--success" id="copy-success" hidden>
            <div className="govuk-notification-banner__content">
              <T>consumer_view.data_table.copy_success</T>
            </div>
          </div>
          <button
            className="govuk-button govuk-button--secondary govuk-button-small copy-icon"
            data-module="govuk-button"
            id="copy-link-button"
          >
            <T>consumer_view.data_table.buttons.copy_link</T>
          </button>
          <a
            href="#downloads"
            className="govuk-button govuk-button--secondary govuk-button-small"
            id="download-table-button"
          >
            <T>consumer_view.data_table.buttons.download</T>
          </a>
        </div>
      </div>

      <NoteCodesLegend {...props} />

      {props.data?.length === 0 ? (
        <p className="govuk-body">
          <T>consumer_view.no_data</T>
        </p>
      ) : (
        <Table isSticky columns={columns} rows={props.data} isSortable />
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
