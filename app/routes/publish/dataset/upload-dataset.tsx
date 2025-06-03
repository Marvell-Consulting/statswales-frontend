import ErrorHandler from '~/components/ErrorHandler';
import { Form, redirect } from 'react-router';
import { ErrorProvider } from '~/context/ErrorProvider';
import { DuckDBSupportFileFormats } from '~/enums/support-fileformats';
import { datasetContext, fetchDatasetMiddleware } from '~/middleware/load-dataset';
import { DatasetInclude } from '~/enums/dataset-include';
import { sessionContext } from '~/middleware/session';
import { type FileUpload, parseFormData } from '@mjackson/form-data-parser';
import { publisherApi } from '~/middleware/publisher-api.server';
import { getLocale } from '~/middleware/i18next.server';
import { useTranslation } from 'react-i18next';
import type { Route } from './+types/upload-dataset';
import { logger } from '~/utils/logger.server';
import type { ViewError } from '~/dtos/view-error';
import { fileMimeTypeHandler } from '~/utils/file-mimetype-handler';
import { ApiException } from '~/exceptions/api.exception';
import type { ViewErrDTO } from '~/dtos/view-dto';
import { localeUrl } from '~/utils/locale-url';

export const unstable_middleware = [fetchDatasetMiddleware(DatasetInclude.Data)];

export const loader = ({ context }: Route.LoaderArgs) => {
  const { dataset } = context.get(datasetContext);

  const revisit = (dataset.dimensions?.length || 0) > 0;
  const supportedFormats = Object.values(DuckDBSupportFileFormats).map((format) =>
    format.toLowerCase()
  );

  return {
    revisit,
    supportedFormats: supportedFormats.join(', '),
    uploadType: false
  };
};

export const action = async ({ context, request }: Route.ActionArgs) => {
  logger.debug('User is uploading a fact table.');
  let errors: ViewError[] = [];
  const { dataset } = context.get(datasetContext);
  const session = context.get(sessionContext);
  const api = context.get(publisherApi);
  const locale = getLocale(context);
  const sessionItem = session.get(`dataset[${dataset.id}]`) || { updateType: undefined };
  const revision = dataset.draft_revision;

  const uploadHandler = async (fileUpload: FileUpload) => {
    if (fileUpload.fieldName === 'csv') {
      const fileName = fileUpload.name;
      const mimeType = fileMimeTypeHandler(fileUpload.type, fileUpload.name);
      const fileData = new Blob([await fileUpload.arrayBuffer()], { type: mimeType });
      logger.debug('Sending file to backend');

      if (sessionItem.updateType) {
        logger.info('Performing an update to the dataset');
        await api.uploadCSVToUpdateDataset(
          dataset.id,
          revision!.id,
          fileData,
          fileName,
          sessionItem.updateType
        );
      } else {
        await api.uploadDataToDataset(dataset.id, fileData, fileName);
      }

      session.set(`dataset[${dataset.id}]`, undefined);
    } else {
      logger.error('No file is present in the request');
      errors.push({ field: 'csv', message: { key: 'publish.upload.errors.missing' } });
      throw new Error();
    }
  };

  try {
    await parseFormData(request, uploadHandler);
  } catch (err) {
    logger.error(err, `There was a problem uploading the file`);
    if (err instanceof ApiException) {
      let body: ViewErrDTO = {
        status: err.status || 500,
        dataset_id: dataset.id,
        errors: [{ field: 'csv', message: { key: 'errors.fact_table_validation.unknown_error' } }]
      };
      try {
        body = JSON.parse(err.body?.toString() || '{}') as ViewErrDTO;
      } catch (parseError) {
        logger.error(parseError, 'Failed to parse error body as JSON');
      }
      // res.status(body.status);
      errors = body.errors || [
        { field: 'csv', message: { key: 'errors.fact_table_validation.unknown_error' } }
      ];
    } else {
      // res.status(500);
      errors = errors.length
        ? errors
        : [{ field: 'csv', message: { key: 'errors.fact_table_validation.unknown_error' } }];
    }
  }

  if (errors.length) {
    return {
      errors
    };
  }

  throw redirect(localeUrl(`/publish/${dataset.id}/preview`, locale));
};

export default function UploadDataset({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <ErrorProvider errors={actionData?.errors}>
      <h1 className="govuk-heading-xl">{t('publish.upload.title')}</h1>

      <ErrorHandler />

      <Form method="POST" encType="multipart/form-data">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="csv">
            {t('publish.upload.form.file.label')}
          </label>
          <input
            className="govuk-file-upload"
            id="csv"
            name="csv"
            type="file"
            placeholder="Upload file"
            accept={loaderData.supportedFormats}
          />
        </div>
        <div className="govuk-button-group">
          <button
            type="submit"
            className="govuk-button"
            data-module="govuk-button"
            style={{ verticalAlign: 'unset' }}
            data-prevent-double-click="true"
          >
            {t('publish.upload.buttons.upload')}
          </button>
        </div>
      </Form>
    </ErrorProvider>
  );
}
