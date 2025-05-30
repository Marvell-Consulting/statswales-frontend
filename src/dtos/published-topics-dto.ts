import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { DatasetListItemDTO } from './dataset-list-item';
import { TopicDTO } from './topic';

export interface PublishedTopicsDTO {
  selectedTopic?: TopicDTO;
  children?: TopicDTO[];
  parents?: TopicDTO[];
  datasets?: ResultsetWithCount<DatasetListItemDTO>;
}
