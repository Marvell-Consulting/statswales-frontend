import ErrorHandler from '~/components/ErrorHandler';
import type { Route } from './+types/start';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from '~/components/LocaleLink';
import { authContext } from '~/middleware/auth-middleware';
import { getEditorUserGroups } from '~/utils/user-permissions';

export const loader = ({ context, request }: Route.LoaderArgs) => {
  const { user } = context.get(authContext)!;
  // TODO: reimplement thiss
  // req.session.errors = undefined;
  // req.session.save();

  // // user must be in at least one group to start a new dataset
  // if (!isEditor(user)) {
  //   req.session.errors = [{ field: '', message: { key: 'publish.start.errors.no_groups' } }];
  //   req.session.save();
  //   res.redirect(req.buildUrl('/', req.language));
  //   return;
  // }

  // if the user is only in a single group, we can bypass group selection and go straight to title
  const editorGroups = getEditorUserGroups(user);
  const datasetGroup = editorGroups[0].group;
  const nextStep = editorGroups.length === 1 ? `title?group_id=${datasetGroup.id}` : 'group';

  return {
    nextStep
  };
};

export default function Start({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="govuk-heading-xl">{t('publish.start.title')}</h1>
      <ErrorHandler />

      <p className="govuk-body">{t('publish.start.p1')}</p>

      <ul className="govuk-list govuk-list--bullet">
        <li>{t('publish.start.data_table')}</li>
        <li>{t('publish.start.lookup_table')}</li>
        <li>{t('publish.start.metadata')}</li>
      </ul>

      <div className="govuk-button-group">
        <LocaleLink path={`/publish/${loaderData.nextStep}`} className="govuk-button">
          {t('buttons.continue')}
        </LocaleLink>
      </div>
    </>
  );
}
