import { LocaleLink } from '~/components/LocaleLink';
import type { Route } from './+types/overview';
import { useTranslation } from 'react-i18next';
import T from '~/components/T';
import { datasetContext, fetchDatasetMiddleware } from '~/middleware/load-dataset';
import { publisherApi } from '~/middleware/publisher-api.server';
import { DatasetInclude } from '~/enums/dataset-include';
import { getLocale } from '~/middleware/i18next.server';
import { redirect } from 'react-router';
import { TaskAction } from '~/enums/task-action';
import ErrorHandler from '~/components/ErrorHandler';
import FlashMessages from '~/components/FlashMessages';
import type { PublishingStatus } from '~/enums/publishing-status';
import { ErrorProvider } from '~/context/ErrorProvider';
import DatasetStatus from '~/components/dataset/DatasetStatus';
import Tabs from '~/components/Tabs';
import type { DatasetStatus as DatasetStatusEnum } from '~/enums/dataset-status';
import Table, { type Columns } from '~/components/Table';
import { authContext } from '~/middleware/auth-middleware';
import { localeUrl } from '~/utils/locale-url';
import type { ViewError } from '~/dtos/view-error';
import { logger } from '~/utils/logger.server';
import { ApiException } from '~/exceptions/api.exception';
import { NotFoundException } from '~/exceptions/not-found.exception';
import { dateFormat } from '~/utils/date-format';
import {
  getApproverUserGroups,
  isApproverForDataset,
  isEditorForDataset
} from '~/utils/user-permissions';
import { getDatasetStatus, getPublishingStatus } from '~/utils/dataset-status';
import type { TaskDTO } from '~/dtos/task';
import type { EventLogDTO } from '~/dtos/event-log';
import { singleLangRevision } from '~/utils/single-lang-dataset';

export const unstable_middleware = [fetchDatasetMiddleware()];

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const locale = getLocale(context);
  const { user } = context.get(authContext);
  if (!user) {
    throw redirect(localeUrl('/auth/login', locale));
  }
  const { dataset, datasetId } = context.get(datasetContext);
  const api = context.get(publisherApi);
  const query = new URL(request.url).searchParams;
  let errors: ViewError[] = [];
  const canMoveGroup = getApproverUserGroups(user).length > 1;
  const canEdit = isEditorForDataset(user, dataset);
  const canApprove = isApproverForDataset(user, dataset);

  try {
    const [dataset, history] = await Promise.all([
      api.getDataset(datasetId, DatasetInclude.Overview),
      api.getDatasetHistory(datasetId)
    ]);

    const revision = singleLangRevision(dataset.end_revision, locale)!;

    if (query.get('withdraw')) {
      try {
        await api.withdrawFromPublication(dataset.id, revision.id);
      } catch (err) {
        logger.error(err, `Failed to withdraw dataset`);
        errors = [{ field: 'withdraw', message: { key: 'publish.overview.error.withdraw' } }];
      }
      throw redirect(localeUrl(`/publish/${dataset.id}/tasklist`, locale));
    }

    const title = revision?.metadata?.title;
    const datasetStatus = getDatasetStatus(dataset);
    const publishingStatus = getPublishingStatus(dataset, revision);
    const openPublishTask = dataset.tasks?.find(
      (task) => task.open && task.action === TaskAction.Publish
    );

    return {
      dataset,
      revision,
      title,
      datasetStatus,
      publishingStatus,
      canMoveGroup,
      canEdit,
      canApprove,
      openPublishTask,
      history
    };
  } catch (err) {
    if (err instanceof ApiException) {
      logger.error(err, `Failed to fetch the dataset overview`);
      throw new NotFoundException();
    }
  }

  const revision = singleLangRevision(dataset.end_revision, locale)!;

  const datasetStatus = getDatasetStatus(dataset);
  const publishingStatus = getPublishingStatus(dataset, revision);

  return { errors, dataset, title: revision.metadata?.title, datasetStatus, publishingStatus };
};

function ActionLink({
  path,
  action,
  newTab,
  queryParams
}: {
  path: string;
  action: string;
  newTab?: boolean;
  queryParams?: Record<string, string | string[]>;
}) {
  return (
    <LocaleLink
      className="govuk-link govuk-link--no-underline"
      path={path}
      query={queryParams}
      target={newTab ? '_blank' : undefined}
    >
      <T>publish.overview.actions.{action}</T>
    </LocaleLink>
  );
}

function ActionsTab({
  datasetId,
  canEdit,
  canApprove,
  canMoveGroup,
  datasetStatus,
  publishingStatus,
  openPublishTask
}: {
  datasetId: string;
  canEdit?: boolean;
  canApprove?: boolean;
  canMoveGroup?: boolean;
  datasetStatus: DatasetStatusEnum;
  publishingStatus: PublishingStatus;
  openPublishTask?: TaskDTO;
}) {
  return (
    <>
      <div className="task-decision-buttons">
        {canApprove &&
          ['pending_approval', 'update_pending_approval'].includes(publishingStatus) && (
            <LocaleLink
              path={`/publish/${datasetId}/task-decision/${openPublishTask?.id}`}
              className="govuk-button govuk-!-margin-top-4"
            >
              <T>publish.overview.buttons.pending_approval</T>
            </LocaleLink>
          )}

        {canEdit && openPublishTask?.status === 'rejected' && (
          <>
            <p className="govuk-body">
              <T>publish.overview.rejected.summary</T>
            </p>
            <p className="govuk-body">{openPublishTask?.comment}</p>
            <LocaleLink
              path={`/publish/${datasetId}/tasklist`}
              className="govuk-button govuk-!-margin-top-4"
            >
              <T>publish.overview.buttons.fix</T>
            </LocaleLink>
          </>
        )}
      </div>

      <ul className="govuk-list">
        {canEdit && publishingStatus === 'incomplete' && (
          <li>
            <ActionLink path={`/publish/${datasetId}/tasklist`} action="continue" />
          </li>
        )}

        {canEdit && publishingStatus === 'update_incomplete' && (
          <li>
            <ActionLink path={`/publish/${datasetId}/tasklist`} action="continue_update" />
          </li>
        )}

        {datasetStatus === 'live' && (
          <li>
            <ActionLink path={`/published/${datasetId}`} action="view_published_dataset" newTab />
          </li>
        )}

        {canEdit && publishingStatus === 'published' && (
          <li>
            <ActionLink path={`/publish/${datasetId}/update`} action="update_dataset" />
          </li>
        )}

        {publishingStatus !== 'published' && (
          <li>
            <ActionLink path={`/publish/${datasetId}/cube-preview`} action="preview" />
          </li>
        )}

        {canEdit &&
          ['pending_approval', 'update_pending_approval', 'scheduled', 'update_scheduled'].includes(
            publishingStatus
          ) && (
            <li>
              <ActionLink
                path={`/publish/${datasetId}/overview`}
                action={
                  ['update_scheduled', 'update_pending_approval'].includes(publishingStatus)
                    ? 'withdraw_update_revision'
                    : 'withdraw_first_revision'
                }
                queryParams={{ withdraw: 'true' }}
              />
            </li>
          )}

        {canMoveGroup && (
          <li>
            <ActionLink path="move" action="move" />
          </li>
        )}
      </ul>
    </>
  );
}

function HistoryTab({ history }: { history: EventLogDTO[] }) {
  const { i18n } = useTranslation();
  const columns: Columns<EventLogDTO> = [
    {
      key: 'created_at',
      label: <T>publish.overview.history.table.created_at</T>,
      format: (createdAt, event) => {
        return (
          <span data-eventid={event.id}>
            {dateFormat(createdAt, 'h:mmaaa, d MMMM yyyy', { locale: i18n.language })}
          </span>
        );
      }
    },
    {
      key: 'action',
      label: <T>publish.overview.history.table.action</T>,
      format: (action, event) => {
        if (event.entity === 'dataset') {
          return <T>publish.overview.history.event.dataset.{action}</T>;
        }

        if (event.entity === 'revision') {
          return <T>publish.overview.history.event.revision.{action}</T>;
        }

        if (event.entity === 'task') {
          const { action, status, isUpdate } = event.data!;

          if (action === 'publish') {
            return (
              <T>
                publish.overview.history.event.task.publish.{isUpdate ? `update_${status}` : status}
              </T>
            );
          }
        }
      }
    },
    {
      key: 'created_by',
      label: <T>publish.overview.history.table.user</T>,
      format: (createdBy) => {
        return createdBy === 'system' ? (
          <T>publish.overview.history.event.created_by.system</T>
        ) : (
          createdBy
        );
      }
    },
    {
      key: 'comment',
      label: <T>publish.overview.history.table.comment</T>,
      format: (value, row) => {
        if (row.entity === 'task') {
          return row.data?.comment;
        }
      }
    }
  ];

  return <Table<EventLogDTO> columns={columns} rows={history} />;
}

export default function Overview({ loaderData }: Route.ComponentProps) {
  const datasetId = loaderData.dataset?.id;
  const { t } = useTranslation();

  return (
    <ErrorProvider errors={loaderData.errors}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <FlashMessages />

          <span className="region-subhead">{t('publish.overview.subheading')}</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{loaderData.title}</h1>

          <DatasetStatus
            publishingStatus={loaderData.publishingStatus}
            datasetStatus={loaderData.datasetStatus}
          />
          <ErrorHandler />

          <div className="overview-details">
            {['pending_approval', 'update_pending_approval'].includes(
              loaderData.publishingStatus as PublishingStatus
            ) &&
              loaderData.revision?.publish_at && (
                <>
                  <p className="govuk-body govuk-!-margin-0">
                    <T
                      publishAt={dateFormat(
                        loaderData.revision?.publish_at,
                        'h:mmaaa, d MMMM yyyy'
                      )}
                    >
                      publish.overview.pending.publish_at
                    </T>
                  </p>
                  <p className="govuk-body govuk-!-margin-0">
                    <T userName={loaderData.openPublishTask?.created_by_name}>
                      publish.overview.pending.requested_by
                    </T>
                  </p>
                </>
              )}

            {['scheduled', 'update_scheduled'].includes(
              loaderData.publishingStatus as PublishingStatus
            ) &&
              loaderData.revision?.publish_at && (
                <p className="govuk-body">
                  <T
                    publishAt={dateFormat(loaderData.revision?.publish_at, 'h:mmaaa, d MMMM yyyy')}
                  >
                    publish.overview.scheduled.publish_at
                  </T>
                </p>
              )}
          </div>

          <Tabs
            tabs={[
              {
                id: 'actions',
                label: <T>publish.overview.tabs.actions</T>,
                children: (
                  <ActionsTab
                    datasetId={loaderData.dataset.id}
                    canEdit={loaderData.canEdit}
                    canApprove={loaderData.canApprove}
                    canMoveGroup={loaderData.canMoveGroup}
                    datasetStatus={loaderData.datasetStatus}
                    publishingStatus={loaderData.publishingStatus}
                    openPublishTask={loaderData.openPublishTask}
                  />
                )
              },
              {
                id: 'history',
                label: <T>publish.overview.tabs.history</T>,
                children: <HistoryTab history={loaderData.history} />
              }
            ]}
          />
        </div>
      </div>
    </ErrorProvider>
  );
}
