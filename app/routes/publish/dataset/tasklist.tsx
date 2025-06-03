import { datasetContext, fetchDatasetMiddleware } from '~/middleware/load-dataset';
import { getLocale } from '~/middleware/i18next.server';
import { Form, redirect } from 'react-router';
import { publisherApi } from '~/middleware/publisher-api.server';
import { sessionContext } from '~/middleware/session';
import T from '~/components/T';
import { LocaleLink } from '~/components/LocaleLink';
import { TaskListStatus } from '~/enums/task-list-status';
import type { PublishingStatus } from '~/enums/publishing-status';
import TasklistStatus from '~/components/TasklistStatus';
import { ErrorProvider } from '~/context/ErrorProvider';
import DatasetStatus from '~/components/dataset/DatasetStatus';
import { DatasetInclude } from '~/enums/dataset-include';
import type { Route } from './+types/tasklist';
import { authContext } from '~/middleware/auth-middleware';
import { localeUrl } from '~/utils/locale-url';
import { getDatasetStatus, getPublishingStatus } from '~/utils/dataset-status';
import type { TaskListState } from '~/dtos/task-list-state';
import { logger } from '~/utils/logger.server';
import { NotFoundException } from '~/exceptions/not-found.exception';
import { isEditorForDataset } from '~/utils/user-permissions';
import { singleLangDataset } from '~/utils/single-lang-dataset';

export const unstable_middleware = [fetchDatasetMiddleware(DatasetInclude.Meta)];

export const loader = async ({ context }: Route.LoaderArgs) => {
  const locale = getLocale(context);
  const { dataset: fetchedDataset } = context.get(datasetContext);
  const { user, isDeveloper } = context.get(authContext);
  if (!user) {
    throw redirect(localeUrl('/auth/login', locale));
  }
  const api = context.get(publisherApi);
  const dataset = singleLangDataset(fetchedDataset, locale);
  const draftRevision = dataset.draft_revision!;
  const datasetStatus = getDatasetStatus(fetchedDataset);
  const publishingStatus = getPublishingStatus(fetchedDataset);
  const canEdit = isEditorForDataset(user, fetchedDataset);
  const datasetTitle = draftRevision.metadata?.title;
  const dimensions = dataset.dimensions;

  let taskList: TaskListState | null = null;

  if (!draftRevision || !canEdit) {
    // tasklist only available for draft revisions and editors
    throw redirect(localeUrl(`/publish/${dataset.id}/overview`, locale));
  }

  try {
    taskList = await api.getTaskList(dataset.id);
  } catch (err) {
    logger.error(err, `Failed to fetch the tasklist`);
    throw redirect('/');
  }

  const canSubmit = canEdit && taskList.canPublish;

  return {
    isDeveloper,
    datasetTitle,
    datasetId: dataset.id,
    taskList,
    revision: draftRevision,
    dimensions,
    datasetStatus,
    publishingStatus,
    canSubmit
  };
};

export const action = async ({ context }: Route.ActionArgs) => {
  const locale = getLocale(context);
  const api = context.get(publisherApi);
  const session = context.get(sessionContext);
  const { dataset: fetchedDataset } = context.get(datasetContext);
  const dataset = singleLangDataset(fetchedDataset, locale);
  const draftRevision = dataset.draft_revision!;

  try {
    await api.submitForPublication(dataset.id, draftRevision.id);
    session.flash('flashMessage', [`publish.tasklist.submit.success`]);
    redirect(localeUrl(`/publish/${dataset.id}/overview`, locale));
  } catch (err) {
    logger.error(err, `Failed to fetch the tasklist`);
    throw new NotFoundException();
  }
};

function Sidebar({
  isDeveloper,
  datasetId,
  publishingStatus
}: {
  isDeveloper?: boolean;
  datasetId: string;
  publishingStatus: PublishingStatus;
}) {
  return (
    <div className="govuk-grid-column-one-third">
      <ul className="govuk-task-list border-top">
        <li className="govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border">
          <div className="govuk-task-list__name-and-hint">
            <LocaleLink path={`/publish/${datasetId}/overview`}>
              <T>publish.tasklist.overview</T>
            </LocaleLink>
          </div>
        </li>
        <li className="govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border">
          <div className="govuk-task-list__name-and-hint">
            <LocaleLink path={`/publish/${datasetId}/cube-preview`} target="_blank">
              <T>publish.tasklist.preview</T>
            </LocaleLink>
          </div>
        </li>
        {isDeveloper && (
          <li className="govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border">
            <div className="govuk-task-list__name-and-hint">
              <LocaleLink path={`/developer/${datasetId}`} target="_blank">
                <T>publish.tasklist.open_developer_view</T>
              </LocaleLink>
            </div>
          </li>
        )}

        {['incomplete', 'update_incomplete'].includes(publishingStatus) && (
          <li className="govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border">
            <div className="govuk-task-list__name-and-hint">
              <LocaleLink path={`/publish/${datasetId}/delete`}>
                <T>
                  publish.tasklist.delete.
                  {publishingStatus === 'incomplete' ? 'dataset' : 'update'}
                </T>
              </LocaleLink>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

function TasklistItem({
  id,
  describedBy,
  translationKey = 'metadata',
  path,
  status,
  datasetId,
  translation
}: {
  id: string;
  describedBy: string;
  translationKey?: string;
  path?: string;
  status: TaskListStatus;
  datasetId: string;
  translation?: string;
}) {
  return (
    <li className="govuk-task-list__item govuk-task-list__item--with-link">
      <div className="govuk-task-list__name-and-hint">
        <LocaleLink
          path={`/publish/${datasetId}/${path || id}`}
          aria-describedby={describedBy}
          className="govuk-link govuk-task-list__link"
        >
          {translation || (
            <T>
              publish.tasklist.{translationKey}.{id}
            </T>
          )}
        </LocaleLink>
      </div>
      <TasklistStatus status={status} />
    </li>
  );
}

export default function Tasklist({ loaderData }: Route.ComponentProps) {
  function getPath() {
    if (loaderData.revision?.revision_index === 0 && !loaderData.revision.data_table_id) {
      return 'update-type';
    } else if (!loaderData.revision.data_table_id) {
      return 'upload';
    } else {
      return 'preview';
    }
  }

  return (
    <ErrorProvider>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="region-subhead">
            <T>publish.tasklist.subheading</T>
          </span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{loaderData.datasetTitle}</h1>
        </div>
      </div>

      <DatasetStatus
        publishingStatus={loaderData.publishingStatus}
        datasetStatus={loaderData.datasetStatus}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">
            <T>publish.tasklist.data.subheading</T>
          </h2>
          <ul className="govuk-task-list">
            <TasklistItem
              id="datatable"
              translationKey="data"
              path={getPath()}
              describedBy="prepare-application-1-status"
              status={loaderData.taskList.datatable}
              datasetId={loaderData.datasetId}
            />
            {loaderData.taskList.measure && (
              <TasklistItem
                id="measure"
                describedBy="prepare-application-1-status"
                status={loaderData.taskList.measure.status}
                datasetId={loaderData.datasetId}
                translation={loaderData.taskList.measure.name}
              />
            )}
            {loaderData.taskList.dimensions?.map((dimension, index) => (
              <TasklistItem
                key={index}
                id="dimension"
                path={`dimension/${dimension.id}`}
                describedBy="prepare-application-1-status"
                status={dimension.status}
                datasetId={loaderData.datasetId}
                translation={dimension.name}
              />
            ))}
          </ul>

          <h2 className="govuk-heading-l govuk-!-margin-top-5">
            <T>publish.tasklist.metadata.subheading</T>
          </h2>
          <ul className="govuk-task-list">
            <TasklistItem
              id="title"
              describedBy="prepare-application-3-status"
              status={loaderData.taskList.metadata.title}
              datasetId={loaderData.datasetId}
            />
            <TasklistItem
              id="summary"
              describedBy="prepare-application-3-status"
              status={loaderData.taskList.metadata.summary}
              datasetId={loaderData.datasetId}
            />
            <TasklistItem
              id="data_collection"
              path="collection"
              status={loaderData.taskList.metadata.collection}
              datasetId={loaderData.datasetId}
            />
            <TasklistItem
              id="statistical_quality"
              path="quality"
              status={loaderData.taskList.metadata.quality}
              datasetId={loaderData.datasetId}
            />
            <TasklistItem
              id="data_sources"
              path="providers"
              status={loaderData.taskList.metadata.sources}
              describedBy="prepare-application-4-status"
              datasetId={loaderData.datasetId}
            />
            <TasklistItem
              id="related_reports"
              path="related"
              status={loaderData.taskList.metadata.related}
              describedBy="prepare-application-5-status"
              datasetId={loaderData.datasetId}
            />
            <TasklistItem
              id="update_frequency"
              path="update-frequency"
              status={loaderData.taskList.metadata.frequency}
              describedBy="prepare-application-5-status"
              datasetId={loaderData.datasetId}
            />
            <TasklistItem
              id="designation"
              status={loaderData.taskList.metadata.designation}
              describedBy="prepare-application-5-status"
              datasetId={loaderData.datasetId}
            />
            <TasklistItem
              id="relevant_topics"
              path="topics"
              status={loaderData.taskList.metadata.topics}
              describedBy="prepare-application-5-status"
              datasetId={loaderData.datasetId}
            />
          </ul>

          <h2 className="govuk-heading-l govuk-!-margin-top-5">
            <T>publish.tasklist.translation.subheading</T>
          </h2>
          <ul className="govuk-task-list">
            <li className="govuk-task-list__item govuk-task-list__item--with-link">
              <div className="govuk-task-list__name-and-hint">
                {loaderData.taskList.translation.export === 'cannot_start' ? (
                  <p className="govkuk-body govuk-!-margin-0">
                    <T>publish.tasklist.translation.export</T>
                  </p>
                ) : (
                  <LocaleLink
                    path={`/publish/${loaderData.datasetId}/translation/export`}
                    className="govuk-link govuk-task-list__link"
                    aria-describedby="prepare-application-5-status"
                  >
                    <T>publish.tasklist.translation.export</T>
                  </LocaleLink>
                )}
              </div>
              <TasklistStatus status={loaderData.taskList.translation.export} />
            </li>
            <li className="govuk-task-list__item govuk-task-list__item--with-link">
              <div className="govuk-task-list__name-and-hint">
                {loaderData.taskList.translation.import === 'cannot_start' ? (
                  <p className="govkuk-body govuk-!-margin-0">
                    <T>publish.tasklist.translation.import</T>
                  </p>
                ) : (
                  <LocaleLink
                    path={`/publish/${loaderData.datasetId}/translation/import`}
                    className="govuk-link govuk-task-list__link"
                    aria-describedby="prepare-application-5-status"
                  >
                    <T>publish.tasklist.translation.import</T>
                  </LocaleLink>
                )}
              </div>
              <TasklistStatus status={loaderData.taskList.translation.import} />
            </li>
          </ul>

          <h2 className="govuk-heading-l govuk-!-margin-top-5">
            <T>publish.tasklist.publishing.subheading</T>
          </h2>
          <ul className="govuk-task-list">
            <TasklistItem
              id="when"
              datasetId={loaderData.datasetId}
              translation={`publish.tasklist.publishing.${
                loaderData.taskList.isUpdate ? 'when_update' : 'when'
              }`}
              path="schedule"
              status={loaderData.taskList.publishing.when}
              describedBy="prepare-application-5-status"
            />
          </ul>
          {loaderData.canSubmit && (
            <div>
              <h2 className="govuk-heading-l govuk-!-margin-top-5">
                <T>publish.tasklist.submit.subheading</T>
              </h2>
              <Form method="post">
                <button type="submit" className="govuk-button" data-module="govuk-button">
                  <T>publish.tasklist.submit.button</T>
                </button>
              </Form>
            </div>
          )}
        </div>
        <Sidebar
          isDeveloper={loaderData.isDeveloper}
          datasetId={loaderData.datasetId}
          publishingStatus={loaderData.publishingStatus}
        />
      </div>
    </ErrorProvider>
  );
}
