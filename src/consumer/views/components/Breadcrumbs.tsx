import React from 'react';

import T from '../../../shared/views/components/T';
import { useLocals } from '../../../shared/views/context/Locals';
import { TopicDTO } from '../../../shared/dtos/topic';
import { Breadcrumb } from '../../../shared/interfaces/breadcrumb';
import { nestTopics } from '../../../shared/utils/nested-topics';
import { topicsToBreadcrumbs } from '../../../shared/utils/topics-to-breadcrumbs';

type TopicBreadcrumbsProps = {
  parentTopics: TopicDTO[];
  selectedTopic?: TopicDTO;
};

export function ParentTopicBreadcrumbs(props: TopicBreadcrumbsProps) {
  const { buildUrl, i18n } = useLocals();

  const breadcrumbs = props.parentTopics?.map((topic: TopicDTO) => ({
    id: topic.id.toString(),
    label: topic.name,
    url: topic.id !== props.selectedTopic?.id ? buildUrl(`/topic/${topic.id}/${topic.slug}`, i18n.language) : undefined
  }));

  return (
    <div className="govuk-breadcrumbs govuk-!-margin-top-4">
      <Breadcrumbs breadcrumbs={breadcrumbs} />
    </div>
  );
}

type BreadcrumbsProps = {
  breadcrumbs: Breadcrumb[];
  excludeHomeLink?: boolean;
};

export function Breadcrumbs(props: BreadcrumbsProps) {
  const { i18n, buildUrl } = useLocals();

  return (
    <nav className="govuk-breadcrumbs govuk-!-margin-0" aria-label="Breadcrumb">
      <ol className="govuk-breadcrumbs__list">
        {!props.excludeHomeLink && (
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href={buildUrl(`/`, i18n.language)}>
              <T>breadcrumbs.home</T>
            </a>
          </li>
        )}

        {props.breadcrumbs?.map((breadcrumb) => (
          <li className="govuk-breadcrumbs__list-item" key={breadcrumb.id}>
            {breadcrumb.url ? (
              <a className="govuk-breadcrumbs__link" href={breadcrumb.url}>
                {breadcrumb.label}
              </a>
            ) : (
              <span>{breadcrumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

type MultiPathBreadcrumbsProps = {
  topics: TopicDTO[];
};

// when a dataset is in multiple topics, show all paths
export function MultiPathBreadcrumbs(props: MultiPathBreadcrumbsProps) {
  if (!props.topics || props.topics.length === 0) return null;

  const { i18n } = useLocals();
  const nestedTopics = nestTopics(props.topics);
  const breadcrumbPaths = topicsToBreadcrumbs(nestedTopics, i18n.language);

  if (breadcrumbPaths.length === 0) return null;
  if (breadcrumbPaths.length === 1) return <Breadcrumbs breadcrumbs={breadcrumbPaths[0]} />;

  return (
    <div className="multi-path-breadcrumbs govuk-!-margin-bottom-4">
      <p className="govuk-body govuk-!-margin-bottom-1">
        <T>breadcrumbs.dataset_location</T>
      </p>
      {breadcrumbPaths.map((breadcrumbs, index) => (
        <Breadcrumbs key={index} breadcrumbs={breadcrumbs} excludeHomeLink={true} />
      ))}
    </div>
  );
}
