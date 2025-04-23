import { Readable } from 'node:stream';

import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';

import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { generateSequenceForNumber, getPaginationProps } from '../utils/pagination';
import { singleLangDataset } from '../utils/single-lang-dataset';
import { getDatasetPreview } from '../utils/dataset-preview';
import { NotFoundException } from '../exceptions/not-found.exception';
import { FileFormat } from '../enums/file-format';
import { getDownloadHeaders } from '../utils/download-headers';
import { logger } from '../utils/logger';
import { Locale } from '../enums/locale';

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
  const pageNumber = Number.parseInt(req.query.page_number as string, 10) || 1;
  const pageSize = Number.parseInt(req.query.page_size as string, 10) || 100;
  let pagination: (string | number)[] = [];

  if (!dataset.live || !revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  const datasetMetadata = await getDatasetPreview(dataset, revision);
  const preview = await req.conapi.getPublishedDatasetView(dataset.id, pageSize, pageNumber, undefined);
  pagination = generateSequenceForNumber(preview.current_page, preview.total_pages);

  res.render('consumer/view', { ...preview, datasetMetadata, pagination });
};

export const downloadPublishedDataset = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug('downloading published dataset');
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  try {
    if (!dataset.live || !revision) {
      throw new NotFoundException('no published revision found');
    }

    let attachmentName: string;
    if (revision.metadata?.title) {
      attachmentName = `${slugify(revision.metadata?.title, { lower: true })}-${revision.revision_index > 0 ? `v${revision.revision_index}` : 'draft'}`;
    } else {
      attachmentName = `${dataset.id}-${revision.revision_index > 0 ? `v${revision.revision_index}` : 'draft'}`;
    }

    const format = req.query.format as FileFormat;
    const lang = req.query.download_language as Locale;
    const headers = getDownloadHeaders(format, attachmentName);

    if (!headers) {
      throw new NotFoundException('invalid file format');
    }

    const fileStream = await req.conapi.getCubeFileStream(dataset.id, format, lang);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (err) {
    next(err);
  }
};
