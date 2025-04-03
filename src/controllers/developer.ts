import { NextFunction, Request, Response } from 'express';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { logger } from '../utils/logger';
import { ViewDTO } from '../dtos/view-dto';
import { NotFoundException } from '../exceptions/not-found.exception';
import { generateSequenceForNumber, getPaginationProps } from '../utils/pagination';
import { DataTableDto } from '../dtos/data-table';
import { RevisionDTO } from '../dtos/revision';
import { Readable } from 'node:stream';
import { singleLangDataset } from '../utils/single-lang-dataset';
import { statusToColour } from '../utils/status-to-colour';
import { getDatasetStatus, getPublishingStatus } from '../utils/dataset-status';
import { FileImportDto } from '../dtos/file-import';
import slugify from 'slugify';
import { FileFormat } from '../enums/file-format';
import { getDownloadHeaders } from '../utils/download-headers';
import { LookupTableDTO } from '../dtos/lookup-table';
import { t } from 'i18next';
import { DatasetDTO } from '../dtos/dataset';

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
  const revision = dataset.revisions?.sort((a, b) => {
    if (a.revision_index < b.revision_index) return -1;
    if (a.revision_index > b.revision_index) return 1;
    return 0;
  })[0];
  const datasetTitle = revision?.metadata?.title || dataset.id;

  const page: number = Number.parseInt(req.query.page_number as string, 10) || 1;
  const pageSize: number = Number.parseInt(req.query.page_size as string, 10) || 10;
  let datasetView: ViewDTO | undefined;
  let unProcessedFilelist: FileImportDto[] = [];

  try {
    logger.debug(`Sending request to backend...`);
    datasetView = await req.pubapi.getDatasetView(dataset.id, page, pageSize);
    unProcessedFilelist = await req.pubapi.getDatasetFileList(dataset.id);
  } catch (err) {
    logger.error(err);
    next(new NotFoundException());
    return;
  }
  if (!datasetView) {
    next(new NotFoundException());
    return;
  }
  unProcessedFilelist = unProcessedFilelist.sort((fileA, fileB) => fileA.filename.localeCompare(fileB.filename));
  unProcessedFilelist.unshift({
    filename: t('developer.display.all_files', { lng: req.language }),
    mime_type: 'application/zip',
    file_type: 'zip',
    type: 'all',
    hash: '',
    parent_id: dataset.id
  });

  const fileList: FileImportDto[][] = [];
  unProcessedFilelist.forEach((file: FileImportDto, index: number) => {
    switch (file.type) {
      case 'data_table':
        file.link = req.buildUrl(`/developer/${dataset.id}/revision/${file.parent_id}/datatable`, req.language);
        break;
      case 'dimension':
        file.link = req.buildUrl(`/developer/${dataset.id}/dimension/${file.parent_id}/lookup`, req.language);
        break;
      case 'measure':
        file.link = req.buildUrl(`/developer/${dataset.id}/measure/lookup`, req.language);
        break;
      case 'all':
        file.link = req.buildUrl(`/developer/${dataset.id}/download`, req.language);
        break;
    }
    if (index % 4 === 0) {
      fileList.push([file]);
    } else {
      fileList[fileList.length - 1].push(file);
    }
  });
  res.locals.pagination = generateSequenceForNumber(datasetView?.current_page, datasetView?.total_pages);
  logger.debug(`Developer view details:\n${JSON.stringify({ ...datasetView, dataset, page, pageSize }, null, 2)}`);
  res.render('developer/data', {
    ...datasetView,
    fileList,
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
  const dataset: DatasetDTO = res.locals.dataset;
  const revision = dataset.revisions?.find((rev: RevisionDTO) => rev.id === req.params.revisionId);

  if (!revision) {
    logger.error('Invalid or missing revisionId');
    next(new NotFoundException('errors.revision_missing'));
    return;
  }

  if (!revision.data_table) {
    logger.error('Invalid or missing data table');
    next(new NotFoundException('errors.data_table_missing'));
    return;
  }

  const dataTable: DataTableDto = revision.data_table;
  try {
    const attachmentName: string = revision.data_table?.original_filename || revision.id;
    const headers = getDownloadHeaders(dataTable.file_type as FileFormat, attachmentName);

    if (!headers) {
      throw new NotFoundException('invalid file format');
    }
    const fileStream = await req.pubapi.getOriginalUpload(dataset.id, revision.id);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (_err) {
    logger.error(_err, 'Error downloading data table');
    next(new NotFoundException('errors.import_missing'));
  }
};

export const downloadLookupFileFromMeasure = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = res.locals.dataset;
  const measure = dataset.measure;

  if (!measure && !measure.lookup_table) {
    logger.error('Invalid or missing measure');
    next(new NotFoundException('errors.measure_missing'));
    return;
  }
  const lookupTable: LookupTableDTO = measure.lookup_table;
  try {
    const attachmentName: string = lookupTable.original_filename || dataset.id;
    const headers = getDownloadHeaders(lookupTable.file_type as FileFormat, attachmentName);

    if (!headers) {
      throw new NotFoundException('invalid file format');
    }
    const fileStream = await req.pubapi.getOriginalUploadMeasure(dataset.id);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (_err) {
    logger.error(_err, 'Error downloading measure lookup file');
    next(new NotFoundException('errors.import_missing'));
  }
};

export const downloadLookupFileFromDimension = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const dimension = dataset.dimensions?.find((dimension) => dimension.id === req.params.dimensionId);

  if (!dimension) {
    logger.error(`Invalid or missing Dimension ID, requested id is ${req.params.dimensionId}`);
    next(new NotFoundException('errors.dimension_missing'));
    return;
  }

  if (!dimension.lookupTable) {
    logger.error('Invalid or missing dimension lookup table');
    next(new NotFoundException('errors.dimension_lookup_missing'));
    return;
  }

  const lookupTable: LookupTableDTO = dimension.lookupTable;
  try {
    const attachmentName: string = lookupTable.original_filename || dimension.id;
    const headers = getDownloadHeaders(lookupTable.file_type as FileFormat, attachmentName);

    if (!headers) {
      throw new NotFoundException('invalid file format');
    }
    const fileStream = await req.pubapi.getOriginalUploadDimension(dataset.id, dimension.id);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (_err) {
    next(new NotFoundException('errors.import_missing'));
  }
};

export const downloadAllDatasetFiles = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.revisions?.sort((revA, revB) => {
    if (revA.revision_index < revB.revision_index) return -1;
    if (revA.revision_index > revB.revision_index) return 1;
    return 0;
  })[0];
  const datasetTitle = revision?.metadata?.title || dataset.id;
  try {
    const attachmentName = `${slugify(datasetTitle, { lower: true })}`;

    const headers = getDownloadHeaders(FileFormat.Zip, attachmentName);

    if (!headers) {
      throw new NotFoundException('invalid file format');
    }
    const fileStream = await req.pubapi.getAllDatasetFiles(dataset.id);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (_err) {
    logger.error(_err, 'Error downloading all files');
    next(new NotFoundException('errors.import_missing'));
  }
};
