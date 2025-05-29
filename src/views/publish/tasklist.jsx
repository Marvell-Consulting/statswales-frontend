import React from 'react';
import Layout from '../components/layouts/Publisher';
import TasklistStatus from '../components/TasklistStatus';
import DatasetStatus from '../components/dataset/DatasetStatus';

function Sidebar(props) {
  return (
    <div className="govuk-grid-column-one-third">
      <ul className="govuk-task-list border-top">
        <li className="govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border">
          <div className="govuk-task-list__name-and-hint">
            <a href={props.buildUrl(`/publish/${props.datasetId}/overview`, props.i18n.language)}>
              {props.t('publish.tasklist.overview')}
            </a>
          </div>
        </li>
        <li className="govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border">
          <div className="govuk-task-list__name-and-hint">
            <a href={props.buildUrl(`/publish/${props.datasetId}/cube-preview`, props.i18n.language)} target="_blank">
              {props.t('publish.tasklist.preview')}
            </a>
          </div>
        </li>
        {props?.isDeveloper && (
          <li className="govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border">
            <div className="govuk-task-list__name-and-hint">
              <a href={props.buildUrl(`/developer/${props.datasetId}`, props.i18n.language)} target="_blank">
                {props.t('publish.tasklist.open_developer_view')}
              </a>
            </div>
          </li>
        )}

        {['incomplete', 'update_incomplete'].includes(props.publishingStatus) && (
          <li className="govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border">
            <div className="govuk-task-list__name-and-hint">
              <a href={props.buildUrl(`/publish/${props.datasetId}/delete`, props.i18n.language)}>
                {props.t(`publish.tasklist.delete.${props.publishingStatus === 'incomplete' ? 'dataset' : 'update'}`)}
              </a>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

export default function Tasklist(props) {
  function getPath() {
    if (props.revision?.revision_index === 0 && !props.revision.data_table_id) {
      return 'update-type';
    } else if (!props.revision.data_table_id) {
      return 'upload';
    } else {
      return 'preview';
    }
  }

  function TasklistItem({ id, describedBy, path, status, translation }) {
    return (
      <li className="govuk-task-list__item govuk-task-list__item--with-link">
        <div className="govuk-task-list__name-and-hint">
          <a
            className="govuk-link govuk-task-list__link"
            href={props.buildUrl(`/publish/${props.datasetId}/${path || id}`, props.i18n.language)}
            aria-describedby={describedBy}
          >
            {props.t(translation || `publish.tasklist.metadata.${id}`)}
          </a>
        </div>
        <TasklistStatus status={status} />
      </li>
    );
  }

  return (
    <Layout {...props}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="region-subhead">{props.t('publish.tasklist.subheading')}</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{props.datasetTitle}</h1>
        </div>
      </div>

      <DatasetStatus {...props} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">{props.t('publish.tasklist.data.subheading')}</h2>
          <ul className="govuk-task-list">
            <li className="govuk-task-list__item govuk-task-list__item--with-link">
              <div className="govuk-task-list__name-and-hint">
                <a
                  className="govuk-link govuk-task-list__link"
                  href={props.buildUrl(`/publish/${props.datasetId}/${getPath()}`, props.i18n.language)}
                  aria-describedby="prepare-application-1-status"
                >
                  {props.t('publish.tasklist.data.datatable')}
                </a>
              </div>
              <TasklistStatus status={props.taskList.datatable} />
            </li>
            {props.taskList.measure && (
              <li className="govuk-task-list__item govuk-task-list__item--with-link">
                <div className="govuk-task-list__name-and-hint">
                  <a
                    className="govuk-link govuk-task-list__link"
                    href={props.buildUrl(`/publish/${props.datasetId}/measure`, props.i18n.language)}
                  >
                    {props.taskList.measure.name}
                  </a>
                </div>
                <TasklistStatus status={props.taskList.measure.status} />
              </li>
            )}
            {props.taskList.dimensions?.map((dimension, index) => (
              <li key={index} className="govuk-task-list__item govuk-task-list__item--with-link">
                <div className="govuk-task-list__name-and-hint">
                  <a
                    className="govuk-link govuk-task-list__link"
                    href={props.buildUrl(`/publish/${props.datasetId}/dimension/${dimension.id}`, props.i18n.language)}
                  >
                    {dimension.name}
                  </a>
                </div>
                <TasklistStatus status={dimension.status} />
              </li>
            ))}
          </ul>

          <h2 className="govuk-heading-l govuk-!-margin-top-5">{props.t('publish.tasklist.metadata.subheading')}</h2>
          <ul className="govuk-task-list">
            <TasklistItem
              id="title"
              describedBy="prepare-application-3-status"
              status={props.taskList.metadata.title}
            />
            <TasklistItem
              id="summary"
              describedBy="prepare-application-3-status"
              status={props.taskList.metadata.summary}
            />
            <TasklistItem id="data_collection" path="collection" status={props.taskList.metadata.collection} />
            <TasklistItem id="statistical_quality" path="quality" status={props.taskList.metadata.quality} />
            <TasklistItem
              id="data_sources"
              path="providers"
              status={props.taskList.metadata.sources}
              describedBy="prepare-application-4-status"
            />
            <TasklistItem
              id="related_reports"
              path="related"
              status={props.taskList.metadata.related}
              describedBy="prepare-application-5-status"
            />
            <TasklistItem
              id="update_frequency"
              path="update-frequency"
              status={props.taskList.metadata.frequency}
              describedBy="prepare-application-5-status"
            />
            <TasklistItem
              id="designation"
              status={props.taskList.metadata.designation}
              describedBy="prepare-application-5-status"
            />
            <TasklistItem
              id="relevant_topics"
              path="topics"
              status={props.taskList.metadata.topics}
              describedBy="prepare-application-5-status"
            />
          </ul>

          <h2 className="govuk-heading-l govuk-!-margin-top-5">{props.t('publish.tasklist.translation.subheading')}</h2>
          <ul className="govuk-task-list">
            <li className="govuk-task-list__item govuk-task-list__item--with-link">
              <div className="govuk-task-list__name-and-hint">
                {props.taskList.translation.export === 'cannot_start' ? (
                  <p className="govkuk-body govuk-!-margin-0">{props.t('publish.tasklist.translation.export')}</p>
                ) : (
                  <a
                    className="govuk-link govuk-task-list__link"
                    href={props.buildUrl(`/publish/${props.datasetId}/translation/export`, props.i18n.language)}
                    aria-describedby="prepare-application-5-status"
                  >
                    {props.t('publish.tasklist.translation.export')}
                  </a>
                )}
              </div>
              <TasklistStatus status={props.taskList.translation.export} />
            </li>
            <li className="govuk-task-list__item govuk-task-list__item--with-link">
              <div className="govuk-task-list__name-and-hint">
                {props.taskList.translation.import === 'cannot_start' ? (
                  <p className="govkuk-body govuk-!-margin-0">{props.t('publish.tasklist.translation.import')}</p>
                ) : (
                  <a
                    className="govuk-link govuk-task-list__link"
                    href={props.buildUrl(`/publish/${props.datasetId}/translation/import`, props.i18n.language)}
                    aria-describedby="prepare-application-5-status"
                  >
                    {props.t('publish.tasklist.translation.import')}
                  </a>
                )}
              </div>
              <TasklistStatus status={props.taskList.translation.import} />
            </li>
          </ul>

          <h2 className="govuk-heading-l govuk-!-margin-top-5">{props.t('publish.tasklist.publishing.subheading')}</h2>
          <ul className="govuk-task-list">
            <TasklistItem
              translation={`publish.tasklist.publishing.${props.taskList.isUpdate ? 'when_update' : 'when'}`}
              path="schedule"
              status={props.taskList.publishing.when}
              describedBy="prepare-application-5-status"
            />
          </ul>
          {props.canSubmit && (
            <div>
              <h2 className="govuk-heading-l govuk-!-margin-top-5">{props.t('publish.tasklist.submit.subheading')}</h2>
              <form encType="multipart/form-data" method="post">
                <button type="submit" className="govuk-button" data-module="govuk-button">
                  {props.t('publish.tasklist.submit.button')}
                </button>
              </form>
            </div>
          )}
        </div>
        <Sidebar {...props} />
      </div>
    </Layout>
  );
}
