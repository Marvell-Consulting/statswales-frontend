import { sessionContext } from '~/middleware/session';
import { publisherApi } from '~/middleware/publisher-api.server';
import { LocaleLink } from '~/components/LocaleLink';
import FlashMessages from '~/components/FlashMessages';
import T from '~/components/T';
import Table, { type Columns } from '~/components/Table';
import Pagination from '~/components/Pagination';
import type { Route } from './+types/list';
import type { ResultsetWithCount } from '~/interfaces/resultset-with-count';
import type { UserGroupListItemDTO } from '~/dtos/user/user-group-list-item-dto';
import { getPaginationProps } from '~/utils/pagination';

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const api = context.get(publisherApi);
  const session = context.get(sessionContext);
  const flash = session.get('flash');

  const query = new URL(request.url).searchParams;
  const page = parseInt(query.get('page_number') as string, 10) || 1;
  const limit = parseInt(query.get('page_size') as string, 10) || 10;
  try {
    const { data, count }: ResultsetWithCount<UserGroupListItemDTO> = await api.listUserGroups(
      page,
      limit
    );
    const pagination = getPaginationProps(page, limit, count);
    return { groups: data, pagination, flash };
  } catch (err) {
    console.log(err);
  }
};

export default function UserGroupList({ loaderData }: Route.ComponentProps) {
  const columns: Columns<UserGroupListItemDTO> = [
    {
      key: 'name',
      format: (value, row) => (
        <LocaleLink path={`/admin/group/${row.id}`} className="govuk-link">
          {value}
        </LocaleLink>
      )
    },
    'email',
    'user_count',
    'dataset_count'
  ];

  return (
    <>
      <FlashMessages />

      <h1 className="govuk-heading-xl">
        <T>admin.group.list.heading</T>
      </h1>

      <LocaleLink path="/admin/group/create" className="govuk-button">
        <T>admin.group.list.buttons.add</T>
      </LocaleLink>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          {loaderData?.groups && loaderData?.groups.length > 0 && (
            <>
              <Table i18nBase="admin.group.list.table" columns={columns} rows={loaderData.groups} />
              {loaderData.pagination.total_pages > 1 && <Pagination {...loaderData.pagination} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
