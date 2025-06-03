import type { Route } from './+types/group';
import { getLocale } from '~/middleware/i18next.server';
import { useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import ErrorHandler from '~/components/ErrorHandler';
import RadioGroup from '~/components/RadioGroup';
import { getGroupIdValidator } from '~/validators';
import { ErrorProvider } from '~/context/ErrorProvider';
import { authContext } from '~/middleware/auth-middleware';
import type { ViewError } from '~/dtos/view-error';
import { singleLangUserGroup } from '~/utils/single-lang-user-group';
import { localeUrl } from '~/utils/locale-url';
import { getEditorUserGroups } from '~/utils/user-permissions';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const { user } = context.get(authContext);
  const locale = getLocale(context);
  const availableGroups =
    getEditorUserGroups(user).map((g) => singleLangUserGroup(g.group, locale)) || [];
  console.log(getEditorUserGroups(user));

  return { availableGroups };
};

export const action = async ({ context, request }: Route.ActionArgs) => {
  const locale = getLocale(context);
  const { user } = context.get(authContext);
  const availableGroups =
    getEditorUserGroups(user).map((g) => singleLangUserGroup(g.group, locale)) || [];
  const validGroupIds = availableGroups.map((group) => group.id) as string[];
  let errors: ViewError[] = [];

  const values = getGroupIdValidator(validGroupIds).safeParse(
    Object.fromEntries(await request.formData())
  );
  if (values.success) {
    console.log('SUCCESS');
    throw redirect(localeUrl(`/publish/title?group_id=${values.data.group_id}`, locale));
  } else {
    errors = values.error.issues.map((issue) => ({
      field: issue.path[0],
      message: {
        key: `publish.group.form.group_id.error.${issue.input ? 'invalid' : 'missing'}`
      }
    }));
  }

  return {
    errors
  };
};

export default function SelectGroup({ loaderData, actionData }: Route.ComponentProps) {
  console.log(actionData);
  const { t } = useTranslation();
  return (
    <ErrorProvider errors={actionData?.errors}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl" id="group-id">
            {t('publish.group.heading')}
          </h1>

          <Form method="POST">
            <ErrorHandler />

            <RadioGroup
              name="group_id"
              labelledBy="group-id"
              options={loaderData.availableGroups.map((group) => ({
                value: group.id || '',
                label: group.name || ''
              }))}
            />

            <button type="submit" className="govuk-button" data-module="govuk-button">
              {t('buttons.continue')}
            </button>
          </Form>
        </div>
      </div>
    </ErrorProvider>
  );
}
