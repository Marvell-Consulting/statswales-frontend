import { TopicDTO } from '../dtos/topic';

export const singleLangTopic = (topic: TopicDTO, lang: string): TopicDTO => {
  return {
    ...topic,
    name: topic.name || (lang.includes('cy') && topic.name_cy ? topic.name_cy : topic.name_en) || ''
  };
};
