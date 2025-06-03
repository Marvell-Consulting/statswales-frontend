import { useTranslation } from 'react-i18next';
import { LocaleLink } from '~/components/LocaleLink';
import Pagination from '~/components/Pagination';
import Table from '~/components/Table';
import type { Route } from './+types/homepage';
import { publisherApi } from '~/middleware/publisher-api.server';
import { authContext } from '~/middleware/auth-middleware';
import type { DatasetListItemDTO } from '~/dtos/dataset-list-item';
import type { ResultsetWithCount } from '~/interfaces/resultset-with-count';
import { getEditorUserGroups } from '~/utils/user-permissions';
import { getPaginationProps } from '~/utils/pagination';
import { dateFormat } from '~/utils/date-format';
import { statusToColour } from '~/utils/status-to-colour';

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const { user } = context.get(authContext);
  const api = context.get(publisherApi);
  // const errors = res.locals.errors;
  const searchParams = new URL(request.url).searchParams;

  try {
    const page = parseInt(searchParams.get('page_number') as string, 10) || 1;
    const limit = parseInt(searchParams.get('page_size') as string, 10) || 20;

    // user must be an editor in at least one group to start a new dataset
    const canCreate = getEditorUserGroups(user).length > 0;

    const results: ResultsetWithCount<DatasetListItemDTO> = await api.getUserDatasetList(
      page,
      limit
    );
    const { data, count } = results;
    const pagination = getPaginationProps(page, limit, count);
    // const flash = res.locals.flash;
    return {
      data,
      pagination,
      // flash,
      canCreate
      // errors
    };
  } catch (err) {
    return {
      data: [],
      canCreate: false
    };
  }
};

export default function Homepage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const columns = [
    {
      key: 'title',
      label: t('homepage.table.title'),
      format: (value, row) => {
        const content = value || `${row.title_alt} [${t('homepage.table.not_translated')}]`;
        return (
          <LocaleLink path={`/publish/${row.id}/overview`} className="govuk-link">
            {content}
          </LocaleLink>
        );
      }
    },
    {
      key: 'group_name',
      label: t('homepage.table.group'),
      cellClassName: 'group nowrap'
    },
    {
      key: 'last_updated',
      label: t('homepage.table.last_updated'),
      style: { width: '15%' },
      format: (value: string) => dateFormat(value, 'd MMMM yyyy', { locale: i18n.language }),
      cellClassName: 'date nowrap'
    },
    {
      key: 'status',
      label: t('homepage.table.dataset_status'),
      format: (value) =>
        value ? (
          <strong className={`govuk-tag max-width-none govuk-tag--${statusToColour(value)}`}>
            {t(`homepage.status.${value}`)}
          </strong>
        ) : null,
      cellClassName: 'status nowrap'
    },
    {
      key: 'publishing_status',
      label: t('homepage.table.publish_status'),
      format: (value) =>
        value ? (
          <strong className={`govuk-tag max-width-none govuk-tag--${statusToColour(value)}`}>
            {t(`homepage.publishing_status.${value}`)}
          </strong>
        ) : null,
      cellClassName: 'status nowrap'
    }
  ];

  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">{t('homepage.heading')}</h1>
        </div>
      </div>

      {loaderData.canCreate && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <LocaleLink path="/publish" className="govuk-button">
              {t('homepage.buttons.create')}
            </LocaleLink>
          </div>
        </div>
      )}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          {loaderData.data && loaderData.data.length > 0 ? (
            <>
              <Table columns={columns} rows={loaderData.data} />
              <Pagination {...loaderData.pagination} />
            </>
          ) : (
            <>
              <p className="govuk-body">{t('homepage.no_results.summary')}</p>
              <ul className="govuk-list govuk-list--bullet">
                <li>{t('homepage.no_results.summary_1')}</li>
                <li>{t('homepage.no_results.summary_2')}</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
}
