import { DatasetDTO } from '../dtos/dataset';
import { SingleLanguageDataset } from '../dtos/single-language/dataset';
import { TaskAction } from '../enums/task-action';
import { TaskStatus } from '../enums/task-status';

export const hasOpenPublishRequest = (dataset: DatasetDTO | SingleLanguageDataset) => {
  return dataset.tasks?.some(
    (task) => task.action === TaskAction.Publish && task.status === TaskStatus.Requested && task.open === true
  );
};
