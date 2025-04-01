import { NextFunction, Request, Response } from 'express';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { logger } from '../utils/logger';
import { ViewDTO } from '../dtos/view-dto';
import { NotFoundException } from '../exceptions/not-found.exception';
import { generateSequenceForNumber, getPaginationProps } from '../utils/pagination';
import { factTableIdValidator, hasError } from '../validators';
import { DataTableDto } from '../dtos/data-table';
import { RevisionDTO } from '../dtos/revision';
import { Readable } from 'node:stream';
import { singleLangDataset } from '../utils/single-lang-dataset';
import { statusToColour } from '../utils/status-to-colour';
import { getDatasetStatus, getPublishingStatus } from '../utils/dataset-status';

export const listAllDatasets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 20;
    const results: ResultsetWithCount<DatasetListItemDTO> = await req.pubapi.getDatasetList(page, limit);
    const { data, count } = results;
    const pagination = getPaginationProps(page, limit, count);
    let flash: string[] = [];
    if (req.session.flash) {
      flash = req.session.flash;
      req.session.flash = undefined;
      req.session.save();
    }
    res.render('developer/list', { data, ...pagination, statusToColour, flash: flash.length > 0 ? flash : undefined });
  } catch (err) {
    next(err);
  }
};

export const displayDatasetPreview = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const datasetStatus = getDatasetStatus(res.locals.dataset);
  const publishingStatus = getPublishingStatus(res.locals.dataset);
  const datasetTitle = dataset.revisions?.[0]?.metadata?.title || dataset.id;
  const page: number = Number.parseInt(req.query.page_number as string, 10) || 1;
  const pageSize: number = Number.parseInt(req.query.page_size as string, 10) || 10;
  let datasetView: ViewDTO | undefined;

  try {
    logger.debug(`Sending request to backend...`);
    datasetView = await req.pubapi.getDatasetView(dataset.id, page, pageSize);
  } catch (err) {
    logger.error(err);
    next(new NotFoundException());
    return;
  }
  if (!datasetView) {
    next(new NotFoundException());
    return;
  }

  res.locals.pagination = generateSequenceForNumber(datasetView?.current_page, datasetView?.total_pages);
  logger.debug(`Developer view details:\n${JSON.stringify({ ...datasetView, dataset, page, pageSize }, null, 2)}`);
  res.render('developer/data', {
    ...datasetView,
    statusToColour,
    datasetStatus,
    publishingStatus,
    datasetTitle,
    dataset,
    page,
    pageSize
  });
};

export const downloadDataTableFromRevision = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = res.locals.dataset;
  const importIdError = await hasError(factTableIdValidator(), req);

  if (importIdError) {
    logger.error('Invalid or missing importId');
    next(new NotFoundException('errors.import_missing'));
    return;
  }

  try {
    let dataTable: DataTableDto | undefined;

    const revision = dataset.revisions?.find((rev: RevisionDTO) => {
      dataTable = rev.data_table;
      return Boolean(dataTable);
    });

    if (!dataTable) {
      throw new Error('errors.import_missing');
    }

    const fileStream = await req.pubapi.getOriginalUpload(dataset.id, revision.id);
    res.status(200);
    res.header('Content-Type', dataTable.mime_type);
    res.header(`Content-Disposition: attachment; filename="${dataTable.filename}"`);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (_err) {
    next(new NotFoundException('errors.import_missing'));
  }
};
