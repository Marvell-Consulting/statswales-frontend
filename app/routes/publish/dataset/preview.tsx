import ErrorHandler from '~/components/ErrorHandler';
import Pagination from '~/components/Pagination';
import RadioGroup from '~/components/RadioGroup';
import Select from '~/components/Select';
import T from '~/components/T';
import Table from '~/components/Table';
import { ErrorProvider } from '~/context/ErrorProvider';
import type { Route } from './+types/preview';
import { datasetContext, fetchDatasetMiddleware } from '~/middleware/load-dataset';
import { DatasetInclude } from '~/enums/dataset-include';
import { sessionContext } from '~/middleware/session';
import { SourceType } from '~/enums/source-type';
import { publisherApi } from '~/middleware/publisher-api.server';
import { z } from 'zod/v4';
import { Form, redirect } from 'react-router';
import { getLocale } from '~/middleware/i18next.server';
import { useTranslation } from 'react-i18next';
import type { FactTableColumnDto } from '~/dtos/fact-table-column-dto';
import type { ViewError } from '~/dtos/view-error';
import type { ViewDTO } from '~/dtos/view-dto';
import { logger } from '~/utils/logger.server';
import { UnknownException } from '~/exceptions/unknown.exception';
import { generateSequenceForNumber } from '~/utils/pagination';
import { localeUrl } from '~/utils/locale-url';

export const unstable_middleware = [fetchDatasetMiddleware(DatasetInclude.Data)];

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const { dataset } = context.get(datasetContext);
  const api = context.get(publisherApi);
  const revision = dataset.draft_revision;
  const dataTable = revision?.data_table;
  const hasUnknownColumns = dataset.fact_table?.some(
    (col: FactTableColumnDto) => col.type === 'unknown'
  );
  const isUpdate = Boolean(revision?.previous_revision_id);
  const revisit = !isUpdate && !hasUnknownColumns;

  const query = new URL(request.url).searchParams;

  let errors: ViewError[] | undefined;
  let previewData: ViewDTO | undefined;
  let ignoredCount = 0;
  let pagination: (string | number)[] = [];

  if (!dataset || !revision || !dataTable) {
    logger.error('Fact table not found');
    throw new UnknownException('errors.preview.import_missing');
  }

  try {
    const pageNumber = Number.parseInt(query.get('page_number') as string, 10) || 1;
    const pageSize = Number.parseInt(query.get('page_size') as string, 10) || 10;
    previewData = await api.getImportPreview(dataset.id, revision.id, pageNumber, pageSize);
    ignoredCount = previewData.headers.filter(
      (header) => header.source_type === SourceType.Ignore
    ).length;
    if (!previewData) {
      throw new Error('No preview data found.');
    }
    pagination = generateSequenceForNumber(previewData.current_page, previewData.total_pages);
  } catch (_err) {
    errors = [{ field: 'preview', message: { key: 'errors.preview.failed_to_get_preview' } }];
  }
  return { ...previewData, ignoredCount, pagination, revisit, errors };
};

const actionChooserSchema = z.object({
  actionChooser: z.enum(['replace-table', 'replace-sources']).nonoptional()
});

const confirmSchema = z.object({
  confirm: z.coerce.boolean()
});

export const action = async ({ context, request }: Route.ActionArgs) => {
  const { dataset } = context.get(datasetContext);
  const locale = getLocale(context);
  const api = context.get(publisherApi);
  const session = context.get(sessionContext);
  const fromSession = session.get(`dataset[${dataset.id}]`) || { updateType: undefined };
  logger.debug(
    `User is confirming the fact table upload and source_type = ${fromSession.updateType}`
  );
  const revision = dataset.draft_revision;
  const isUpdate = Boolean(revision?.previous_revision_id);
  const hasUnknownColumns = dataset.fact_table?.some(
    (col: FactTableColumnDto) => col.type === 'unknown'
  );
  const revisit = !isUpdate && !hasUnknownColumns;
  const formData = Object.fromEntries(await request.formData());

  let errors: ViewError[] | undefined;

  if (revisit) {
    const result = actionChooserSchema.safeParse(formData);
    if (result.success) {
      switch (result.data.actionChooser) {
        case 'replace-table':
          throw redirect(localeUrl(`/publish/${dataset.id}/upload`, locale));
        case 'replace-sources':
          throw redirect(localeUrl(`/publish/${dataset.id}/sources`, locale));
      }
    } else {
      errors = [{ field: 'actionChooserTable', message: { key: 'errors.preview.select_action' } }];
    }
  } else {
    const result = confirmSchema.safeParse(formData);
    if (result.success && result.data.confirm) {
      if (revision?.revision_index === 0) {
        redirect(localeUrl(`/publish/${dataset.id}/tasklist`, locale));
      } else {
        try {
          await api.confirmDataTable(dataset.id, revision!.id);
        } catch {
          errors = [{ field: 'confirm', message: { key: 'errors.preview.confirm_error' } }];
        }

        if (errors?.length) {
          return {
            errors
          };
        }

        throw redirect(localeUrl(`/publish/${dataset.id}/sources`, locale));
      }
    } else if (revision?.revision_index === 0) {
      redirect(localeUrl(`/publish/${dataset.id}/update-type`, locale));
    } else {
      redirect(localeUrl(`/publish/${dataset.id}/upload`, locale));
    }
    return;
  }
};

export default function Preview({ loaderData }: Route.ComponentProps) {
  const { i18n } = useTranslation();
  const returnLink =
    loaderData.revisit &&
    loaderData.dataset?.id &&
    localeUrl(`/publish/${loaderData.dataset?.id}/tasklist`, i18n.language);
  const backLink = loaderData.revisit && returnLink;
  const colgroup = (
    <>
      {loaderData.headers?.map((header, index) => (
        <col key={index} className={header.source_type === 'ignore' ? 'ignore-column' : ''} />
      ))}
    </>
  );
  const columns = loaderData.headers?.map((header, index) => {
    return {
      key: index,
      label:
        header.source_type === SourceType.LineNumber ? (
          <span className="govuk-visually-hidden">
            <T>publish.preview.row_number</T>
          </span>
        ) : (
          (() => {
            const type =
              header.source_type && header.source_type !== SourceType.Unknown ? (
                <>
                  <span className="region-subhead">
                    <T>publish.preview.source_type.{header.source_type}</T>
                  </span>
                  <br />
                </>
              ) : null;
            return (
              <div>
                {type}
                <span>
                  {header.name || <T colNum={index + 1}>publish.preview.unnamed_column</T>}
                </span>
              </div>
            );
          })()
        ),
      cellClassNameName: header.source_type
    };
  });
  return (
    <ErrorProvider>
      <h1 className="govuk-heading-xl">
        <T>{loaderData.revisit ? 'publish.preview.heading_summary' : 'publish.preview.heading'}</T>
      </h1>

      <ErrorHandler />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half" style={{ paddingTop: '7px' }}>
          <p className="govuk-body">
            {loaderData.revisit ? (
              <T
                cols={(loaderData.headers?.length || 0) - loaderData.ignoredCount}
                rows={loaderData.page_info?.total_records}
                ignored={loaderData.ignoredCount}
              >
                publish.preview.upload_summary
              </T>
            ) : (
              <T cols={loaderData.headers?.length || 0} rows={loaderData.page_info?.total_records}>
                publish.preview.preview_summary
              </T>
            )}
          </p>
        </div>
        <div className="govuk-grid-column-one-half" style={{ textAlign: 'right' }}>
          <Form role="page-size" className="govuk-!-margin-bottom-0">
            <Select
              name="page_size"
              label={<T>pagination.page_size</T>}
              options={[5, 10, 25, 50, 100, 250, 500]}
              value={loaderData.page_size ? String(loaderData.page_size) : undefined}
              inline
            />{' '}
            {/* FIXME: why is this not defined? is it needed? */}
            <input type="hidden" name="file" value={loaderData.datafile_id} />
            <input type="hidden" name="page_number" value="1" />
            <button
              type="submit"
              className="govuk-button govuk-button-small govuk-!-display-inline"
              data-module="govuk-button"
            >
              <T>pagination.update</T>
            </button>
          </Form>
        </div>
      </div>
      {loaderData.data && (
        <>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full with-overflow">
              <Table isSticky columns={columns} rows={loaderData.data} colgroup={colgroup} />
            </div>
          </div>

          {/* FIXME: these should be defined */}
          <Pagination
            total_pages={loaderData.total_pages}
            current_page={loaderData.current_page}
            page_size={loaderData.page_size}
            pagination={loaderData.pagination}
            page_info={loaderData.page_info}
          />
          {loaderData.revisit ? (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <form method="post" role="continue">
                  <RadioGroup
                    name="actionChooser"
                    label={<T>publish.preview.revisit_question</T>}
                    options={[
                      {
                        value: 'replace-table',
                        label: <T>publish.preview.upload_different</T>,
                        hint: <T>publish.preview.upload_different_hint</T>
                      },
                      {
                        value: 'replace-sources',
                        label: <T>publish.preview.change_source</T>,
                        hint: <T>publish.preview.change_source_hint</T>
                      }
                    ]}
                  />
                  <div className="govuk-button-group">
                    <button
                      type="submit"
                      name="confirm"
                      value="true"
                      className="govuk-button"
                      data-module="govuk-button"
                      style={{ verticalAlign: 'unset' }}
                      data-prevent-double-click="true"
                    >
                      <T>buttons.continue</T>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <form method="post" role="continue">
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                      <h2 className="govuk-fieldset__heading">
                        <T>publish.preview.confirm_correct</T>
                      </h2>
                    </legend>
                    <div className="govuk-button-group">
                      <button
                        type="submit"
                        name="confirm"
                        value="true"
                        className="govuk-button"
                        data-module="govuk-button"
                        style={{ verticalAlign: 'unset' }}
                        data-prevent-double-click="true"
                      >
                        <T>buttons.continue</T>
                      </button>
                    </div>
                  </fieldset>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </ErrorProvider>
  );
}
