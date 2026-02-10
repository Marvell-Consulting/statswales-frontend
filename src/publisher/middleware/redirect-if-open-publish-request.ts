import { Request, Response, NextFunction } from 'express';
import { TaskDTO } from '../../shared/dtos/task';
import { TaskAction } from '../../shared/enums/task-action';
import { TaskStatus } from '../../shared/enums/task-status';

export const redirectIfOpenPublishRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.params.datasetId) return next();

  try {
    const openTasks: TaskDTO[] = await req.pubapi.getDatasetTasks(req.params.datasetId, true);

    if (openTasks.some((task) => task.action === TaskAction.Publish && task.status === TaskStatus.Requested)) {
      return res.redirect(req.buildUrl(`/publish/${req.params.datasetId}/overview`, req.language));
    }
  } catch (err) {
    return next(err);
  }

  next();
};
