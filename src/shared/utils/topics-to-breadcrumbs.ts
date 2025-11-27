import slugify from 'slugify';
import { Breadcrumb } from '../interfaces/breadcrumb';
import { localeUrl } from '../middleware/language-switcher';
import { NestedTopic } from './nested-topics';
import { Locale } from '../enums/locale';

export const topicsToBreadcrumbs = (nestedTopics: NestedTopic[], language: Locale): Breadcrumb[][] => {
  const result: Breadcrumb[][] = [];

  const traverse = (topics: NestedTopic[], path: Breadcrumb[] = []) => {
    for (const topic of topics) {
      const newPath = [
        ...path,
        {
          id: topic.id.toString(),
          label: topic.name,
          url: localeUrl(`/topic/${topic.id}/${slugify(topic.name, { lower: true })}`, language)
        }
      ];

      if (topic.children.length === 0) {
        result.push(newPath);
      } else {
        traverse(topic.children, newPath);
      }
    }
  };

  traverse(nestedTopics);

  return result;
};
