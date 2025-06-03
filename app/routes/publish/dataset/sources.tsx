import { datasetContext, fetchDatasetMiddleware } from '~/middleware/load-dataset';
import type { Route } from './+types/sources';
import { DatasetInclude } from '~/enums/dataset-include';
import { SourceType } from '~/enums/source-type';
import { z } from 'zod/v4';
import { Form, redirect } from 'react-router';
import Select from '~/components/Select';
import T from '~/components/T';
import ErrorHandler from '~/components/ErrorHandler';
import { useTranslation } from 'react-i18next';
import { publisherApi } from '~/middleware/publisher-api.server';
import { getLocale } from '~/middleware/i18next.server';
import type { FactTableColumnDto } from '~/dtos/fact-table-column-dto';
import { logger } from '~/utils/logger.server';
import { UnknownException } from '~/exceptions/unknown.exception';
import type { ViewError } from '~/dtos/view-error';
import type { SourceAssignmentDTO } from '~/dtos/source-assignment-dto';
import type { ViewErrDTO } from '~/dtos/view-dto';
import type { ApiException } from '~/exceptions/api.exception';
import { localeUrl } from '~/utils/locale-url';

export const unstable_middleware = [fetchDatasetMiddleware(DatasetInclude.Data)];

export const loader = async ({ context }: Route.LoaderArgs) => {
  const { dataset } = context.get(datasetContext);
  const revision = dataset.draft_revision;

  const factTable = dataset.fact_table?.sort(
    (colA: FactTableColumnDto, colB: FactTableColumnDto) => colA.index - colB.index
  ) as FactTableColumnDto[];

  const revisit =
    factTable.filter((column: FactTableColumnDto) => column.type === SourceType.Unknown).length ===
    0;

  if (!dataset || !revision || !factTable) {
    logger.error('Fact table not found');
    throw new UnknownException('errors.preview.import_missing');
  }

  return {
    dataset,
    factTable,
    sourceTypes: Object.values(SourceType).filter((s) => s !== SourceType.LineNumber),
    revisit
  };
};

const sourceTypeSchema = z.enum(SourceType).nonoptional();

export const action = async ({ context, request }: Route.ActionArgs) => {
  logger.debug('Validating the source definition');
  const api = context.get(publisherApi);
  const { dataset } = context.get(datasetContext);
  const locale = getLocale(context);
  const revision = dataset.draft_revision;

  const factTable = dataset.fact_table?.sort(
    (colA: FactTableColumnDto, colB: FactTableColumnDto) => colA.index - colB.index
  ) as FactTableColumnDto[];

  let error: ViewError | undefined;
  let errors: ViewError[] | undefined;

  const formData = Object.fromEntries(await request.formData());
  const counts = { unknown: 0, dataValues: 0, footnotes: 0, measure: 0 };
  const sourceAssignment: SourceAssignmentDTO[] = factTable.map((column: FactTableColumnDto) => {
    const result = sourceTypeSchema.safeParse(formData[`column-${column.index}`]);
    if (result.error) {
      counts.unknown++;
    } else {
      if (result.data === SourceType.Unknown) counts.unknown++;
      if (result.data === SourceType.DataValues) counts.dataValues++;
      if (result.data === SourceType.NoteCodes) counts.footnotes++;
      if (result.data === SourceType.Measure) counts.measure++;
    }

    return {
      column_index: column.index,
      column_name: column.name,
      column_type: result.data!
    };
  });

  factTable.forEach((column: FactTableColumnDto) => {
    column.type =
      sourceAssignment.find(
        (assignment: SourceAssignmentDTO) => assignment.column_index === column.index
      )?.column_type || SourceType.Unknown;
  });

  if (counts.unknown > 0) {
    logger.error('User failed to identify all sources');
    error = { field: 'source', message: { key: 'errors.sources.unknowns_found' } };
  }

  if (counts.footnotes === 0) {
    logger.error('User failed to identify the mandated footnotes column');
    error = { field: 'source', message: { key: 'errors.sources.no_notes_column' } };
  }

  if (counts.dataValues > 1) {
    logger.error('User tried to specify multiple data value sources');
    error = { field: 'source', message: { key: 'errors.sources.multiple_datavalues' } };
  }

  if (counts.footnotes > 1) {
    logger.error('User tried to specify multiple footnote sources');
    error = { field: 'source', message: { key: 'errors.sources.multiple_footnotes' } };
  }

  if (counts.measure > 1) {
    logger.error('User tried to specify multiple measure sources');
    error = { field: 'source', message: { key: 'errors.sources.multiple_measures' } };
  }

  let viewErr: ViewErrDTO | null = null;

  if (error) {
    logger.error('There were errors validating the fact table');
    errors = [error];
  } else {
    logger.debug('Sending request to the backend.');
    try {
      await api.assignSources(dataset.id, sourceAssignment);
    } catch (err) {
      const error = err as ApiException;
      viewErr = JSON.parse((error.body as string) || '{}') as ViewErrDTO;
      if (viewErr.errors) {
        errors = viewErr.errors;
      } else {
        errors = [{ field: 'source', message: { key: 'errors.sources.assign_failed' } }];
      }
      logger.error(err, `There was a problem assigning source types`);
      // TODO: reimplement these
      // if (errors[0].message.key === 'errors.fact_table_validation.incomplete_fact') {
      //   res.render('publish/empty-fact', { ...viewErr, dimension: { factTableColumn: '' } });
      //   return;
      // } else if (errors[0].message.key === 'errors.fact_table_validation.duplicate_fact') {
      //   res.render('publish/duplicate-fact', { ...viewErr, dimension: { factTableColumn: '' } });
      //   return;
      // } else if (errors[0].message.key === 'errors.fact_table_validation.bad_note_codes') {
      //   res.render('publish/bad-note-codes', { ...viewErr, dimension: { factTableColumn: '' } });
      //   return;
      // }
    }
  }
  if (errors?.length) {
    return {
      errors,
      viewErr
    };
  }
  throw redirect(localeUrl(`/publish/${dataset.id}/tasklist`, locale));
};

export default function Sources({ loaderData, actionData }: Route.ComponentProps) {
  const { i18n } = useTranslation();
  const returnLink =
    loaderData.revisit &&
    loaderData.dataset.id &&
    localeUrl(`/publish/${loaderData.dataset.id}/tasklist`, i18n.language);
  const backLink = returnLink;

  if (actionData?.errors?.[0].message.key === 'errors.fact_table_validation.incomplete_fact') {
  }

  if (actionData?.errors?.[0].message.key === 'errors.fact_table_validation.duplicate_fact') {
  }

  if (actionData?.errors?.[0].message.key === 'errors.fact_table_validation.bad_note_codes') {
  }
  return (
    <>
      <h1 className="govuk-heading-xl">
        <T>publish.sources.heading</T>
      </h1>
      <ErrorHandler />
      <Form method="post">
        <div
          className="source-list"
          style={{
            marginBottom: '2em'
          }}
        >
          {loaderData.factTable.map((source, idx) => (
            <div
              key={idx}
              className="source-list-item"
              style={{
                borderBottom: '1px solid #0b0c0c',
                paddingBottom: '0.5em',
                marginBottom: '0.5em'
              }}
            >
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                  <Select
                    name={`column-${source.index}`}
                    className="govuk-!-display-inline"
                    label={source.name || <T colNum={idx + 1}>publish.preview.unnamed_column</T>}
                    labelClassName="govuk-label--s"
                    labelStyle={{ minWidth: '30%', display: 'inline-block' }}
                    options={loaderData.sourceTypes.map((val) => ({
                      value: val,
                      label: <T>publish.sources.types.{val}</T>
                    }))}
                    value={source.type}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <p className="govuk-body">
              <button type="submit" className="govuk-button" data-module="govuk-button">
                <T>buttons.continue</T>
              </button>
            </p>
          </div>
        </div>
      </Form>
    </>
  );
}
