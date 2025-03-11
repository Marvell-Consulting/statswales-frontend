import { Readable } from 'node:stream';

import { Request, Response, NextFunction } from 'express';

import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { getPaginationProps } from '../utils/pagination';
import { singleLangDataset } from '../utils/single-lang-dataset';
import { getDatasetPreview } from '../utils/dataset-preview';
import { NotFoundException } from '../exceptions/not-found.exception';
import { FileFormat } from '../enums/file-format';
import { getDownloadHeaders } from '../utils/download-headers';
import { logger } from '../utils/logger';

export const listPublishedDatasets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 10;
    const results: ResultsetWithCount<DatasetListItemDTO> = await req.conapi.getPublishedDatasetList(page, limit);

    const { data, count } = results;
    const pagination = getPaginationProps(page, limit, count);

    res.render('consumer/list', { data, count, ...pagination, hide_pagination_hint: true });
  } catch (err) {
    next(err);
  }
};

export const viewPublishedDataset = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  if (!dataset.live || !revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  const preview = await getDatasetPreview(dataset, revision);

  res.render('consumer/view', { dataset, preview });
};

export const downloadPublishedDataset = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug('downloading published dataset');
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  try {
    if (!dataset.live || !revision) {
      throw new NotFoundException('no published revision found');
    }

    const format = req.query.format as FileFormat;
    const headers = getDownloadHeaders(format, revision.id);

    if (!headers) {
      throw new NotFoundException('invalid file format');
    }

    const fileStream = await req.conapi.getCubeFileStream(dataset.id, revision.id, format);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (err) {
    next(err);
  }
};
