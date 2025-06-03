import clsx from 'clsx';
import type { Route } from './+types/title';
import { singleLangDataset } from 'server/utils/single-lang-dataset';
import { getLocale } from '~/middleware/i18next.server';
import type { ViewError } from 'server/dtos/view-error';
import ErrorHandler from '~/components/ErrorHandler';
import { localeUrl } from 'server/utils/locale-url';
import { redirect } from 'react-router';
import { titleValidator } from '~/validators';
import { publisherApi } from '~/middleware/publisher-api.server';
import { ApiException } from 'server/exceptions/api.exception';
import { useTranslation } from 'react-i18next';

export const loader = ({ context, request }: Route.LoaderArgs) => {
  const locale = getLocale(context);
  const dataset = null;

  const existingDataset = dataset ? singleLangDataset(dataset, locale) : undefined;
  const revisit = Boolean(existingDataset); // dataset will not exist the first time through
  let title = existingDataset?.draft_revision?.metadata?.title;

  return { title, revisit, datasetId: dataset?.id };
};

export const action = async ({ context, request }: Route.ActionArgs) => {
  const locale = getLocale(context);
  const api = context.get(publisherApi);
  const searchParams = new URL(request.url).searchParams;
  const groupId = searchParams.get('group_id');
  let errors: ViewError[] = [];
  // todo: fix this
  const existingDataset: { id: string } | null = null;
  try {
    const result = titleValidator.safeParse(Object.fromEntries(await request.formData()));
    if (result.success) {
      const title = result.data.title;
      if (existingDataset) {
        await api.updateMetadata(existingDataset.id, { title, language: locale });
      } else {
        if (!groupId) {
          errors.push({ field: '', message: { key: 'publish.title.form.group_id.error.missing' } });
          throw new Error();
        }

        const dataset = await api.createDataset(title, groupId, locale);
        redirect(localeUrl(`/publish/${dataset.id}/upload`, locale));
      }
    } else {
      errors = result.error.issues.map((issue) => ({
        field: issue.path[0],
        message: { key: `publish.title.form.title.error.${issue.message}` }
      }));
    }

    return;
  } catch (err) {
    if (err instanceof ApiException) {
      errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
    }
  }
  if (errors.length) {
    return { errors };
  }
  throw redirect(localeUrl(`/publish/${existingDataset.id}/tasklist`, locale));
};

export default function Title({ loaderData, actionData }: Route.ComponentProps) {
  const { i18n, t } = useTranslation();
  const returnLink =
    loaderData.revisit &&
    loaderData.datasetId &&
    localeUrl(`/publish/${loaderData.datasetId}/tasklist`, i18n.language);
  const backLink = props.revisit && returnLink;
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <h1 className="govuk-heading-xl">{props.t('publish.title.heading')}</h1>

      <ErrorHandler />

      <ul className="govuk-list govuk-list--bullet">
        <li>{props.t('publish.title.appear')}</li>
        <li>{props.t('publish.title.descriptive')}</li>
      </ul>

      <div className="govuk-hint">{props.t('publish.title.form.title.hint')}</div>

      <form encType="multipart/form-data" method="post">
        <div className="govuk-form-group">
          <input
            className={clsx('govuk-input', {
              'govuk-input--error': props.errors?.find((e) => e.field === 'title')
            })}
            id="title"
            name="title"
            type="text"
            value={props.title}
          />
        </div>
        <button type="submit" className="govuk-button" data-module="govuk-button">
          {props.t('buttons.continue')}
        </button>
      </form>
    </Layout>
  );
}
