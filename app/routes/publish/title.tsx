import type { Route } from './+types/title';
import { getLocale } from '~/middleware/i18next.server';
import ErrorHandler from '~/components/ErrorHandler';
import { Form, redirect } from 'react-router';
import { titleValidator } from '~/validators';
import { publisherApi } from '~/middleware/publisher-api.server';
import { useTranslation } from 'react-i18next';
import { ErrorProvider } from '~/context/ErrorProvider';
import { InputText } from '~/components/InputText';
import { SubmitButton } from '~/components/SubmitButton';
import type { ViewError } from '~/dtos/view-error';
import { ApiException } from '~/exceptions/api.exception';
import { localeUrl } from '~/utils/locale-url';

export const action = async ({ context, request }: Route.ActionArgs) => {
  let errors: ViewError[] = [];
  const locale = getLocale(context);
  const api = context.get(publisherApi);
  const searchParams = new URL(request.url).searchParams;
  const groupId = searchParams.get('group_id');
  const formData = Object.fromEntries(await request.formData());
  const result = titleValidator.safeParse(formData);
  let datasetId: string | undefined = undefined;

  console.log(result);

  try {
    if (result.success) {
      const title = result.data.title;
      if (!groupId) {
        errors.push({ field: '', message: { key: 'publish.title.form.group_id.error.missing' } });
        throw new Error();
      }

      const dataset = await api.createDataset(title, groupId, locale);
      datasetId = dataset.id;
    } else {
      errors = result.error.issues.map((issue) => ({
        field: issue.path[0],
        message: { key: `publish.title.form.title.error.${issue.message}` }
      }));
    }
  } catch (err) {
    if (err instanceof ApiException) {
      errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
    }
  }
  if (errors.length) {
    return {
      errors,
      title: result.data?.title || (formData.title as string)
    };
  }
  throw redirect(localeUrl(`/publish/${datasetId}/upload`, locale));
};

export default function Title({ actionData }: Route.ComponentProps) {
  console.log({ actionData });
  const { t } = useTranslation();
  return (
    <ErrorProvider errors={actionData?.errors}>
      <h1 className="govuk-heading-xl" id="title-label">
        {t('publish.title.heading')}
      </h1>

      <ErrorHandler />

      <ul className="govuk-list govuk-list--bullet">
        <li>{t('publish.title.appear')}</li>
        <li>{t('publish.title.descriptive')}</li>
      </ul>

      <div className="govuk-hint">{t('publish.title.form.title.hint')}</div>

      <Form method="POST">
        <InputText name="title" value={actionData?.title} labelledBy="title-label" />
        <SubmitButton />
      </Form>
    </ErrorProvider>
  );
}
