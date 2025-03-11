import { TopicDTO } from '../dtos/topic';

export interface NestedTopic {
  id: number;
  path: string;
  name: string;
  children: NestedTopic[];
}

export const nestTopics = (topics: TopicDTO[]): NestedTopic[] => {
  return topics.reduce((nested: NestedTopic[], topic: TopicDTO) => {
    const parentPath = topic.path.substring(0, topic.path.lastIndexOf('.'));
    const parentTopic = recursiveFind(nested, parentPath);

    if (parentTopic) {
      parentTopic.children.push({
        id: topic.id,
        path: topic.path,
        name: topic.name,
        children: []
      });

      return nested;
    }

    nested.push({
      id: topic.id,
      path: topic.path,
      name: topic.name,
      children: []
    });

    return nested;
  }, []);
};

const recursiveFind = (topics: NestedTopic[], path: string): NestedTopic | undefined => {
  for (const topic of topics) {
    if (topic.path === path) return topic;
    const child = recursiveFind(topic.children, path);
    if (child) return child;
  }
  return undefined;
};
