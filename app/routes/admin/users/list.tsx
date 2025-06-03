import type { Route } from './+types/list';
import { publisherApi } from '~/middleware/publisher-api.server';
import { LocaleLink } from '~/components/LocaleLink';
import T from '~/components/T';
import type { Columns } from '~/components/Table';
import FlashMessages from '~/components/FlashMessages';
import Table from '~/components/Table';
import { getPaginationProps } from '~/utils/pagination';
import type { ResultsetWithCount } from '~/interfaces/resultset-with-count';
import type { UserDTO } from '~/dtos/user/user';
import { dateFormat } from '~/utils/date-format';
import { statusToColour } from '~/utils/status-to-colour';

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const api = context.get(publisherApi);
  const query = new URL(request.url).searchParams;
  try {
    const page = parseInt(query.get('page_number') as string, 10) || 1;
    const limit = parseInt(query.get('page_size') as string, 10) || 10;
    const { data, count }: ResultsetWithCount<UserDTO> = await api.listUsers(page, limit);
    const pagination = getPaginationProps(page, limit, count);
    return { users: data, count, pagination };
  } catch (err) {
    return { errors: [err] };
  }
};

export default function UserList({ loaderData }: Route.ComponentProps) {
  const columns: Columns<UserDTO> = [
    {
      key: 'full_name',
      label: <T>admin.user.list.table.name</T>,
      format: (value, row) => (
        <LocaleLink path={`/admin/user/${row.id}`} className="govuk-link">
          {value || row.email}
        </LocaleLink>
      )
    },
    {
      key: 'groups',
      format: (value) => value?.length || 0
    },
    {
      key: 'last_login_at',
      label: <T>admin.user.list.table.login</T>,
      format: (value) =>
        value ? dateFormat(value, 'd MMMM yyyy h:mm a') : <T>admin.user.view.login_never</T>
    },
    {
      key: 'status',
      format: (value) => (
        <strong className={`govuk-tag govuk-tag--${statusToColour(value)}`}>
          <T>admin.user.badge.status.{value}</T>
        </strong>
      )
    }
  ];
  return (
    <>
      <FlashMessages />

      <h1 className="govuk-heading-xl">
        <T>admin.user.list.heading</T>
      </h1>

      <LocaleLink path={`/admin/user/create`} className="govuk-button">
        <T>admin.user.list.buttons.add</T>
      </LocaleLink>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          {loaderData?.users && loaderData?.users.length > 0 && (
            <Table i18nBase="admin.user.list.table" columns={columns} rows={loaderData.users} />
          )}
        </div>
      </div>
    </>
  );
}
