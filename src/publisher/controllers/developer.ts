import { Readable } from 'node:stream';

import { NextFunction, Request, Response } from 'express';
import hljs from 'highlight.js';
import slugify from 'slugify';
import { t } from 'i18next';

import { ResultsetWithCount } from '../../shared/interfaces/resultset-with-count';
import { DatasetListItemDTO } from '../../shared/dtos/dataset-list-item';
import { logger } from '../../shared/utils/logger';
import { ViewDTO } from '../../shared/dtos/view-dto';
import { NotFoundException } from '../../shared/exceptions/not-found.exception';
import { generateSequenceForNumber, getPaginationProps } from '../../shared/utils/pagination';
import { singleLangDataset, singleLangRevision } from '../../shared/utils/single-lang-dataset';
import { statusToColour } from '../../shared/utils/status-to-colour';
import { getDatasetStatus, getPublishingStatus } from '../../shared/utils/dataset-status';
import { FileImportDto } from '../../shared/dtos/file-import';
import { FileFormat } from '../../shared/enums/file-format';
import { getDownloadHeaders } from '../../shared/utils/download-headers';
import { LookupTableDTO } from '../../shared/dtos/lookup-table';
import { getDatasetPreview } from '../../shared/utils/dataset-preview';
import { PreviewMetadata } from '../../shared/interfaces/preview-metadata';
import { ViewError } from '../../shared/dtos/view-error';
import { DatasetInclude } from '../../shared/enums/dataset-include';
import { UnknownException } from '../../shared/exceptions/unknown.exception';

export const listAllDatasets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 20;
    const results: ResultsetWithCount<DatasetListItemDTO> = await req.pubapi.getFullDatasetList(page, limit);
    const { data, count } = results;
    const pagination = getPaginationProps(page, limit, count);
    const flash = res.locals.flash;
    res.render('developer/list', { data, ...pagination, statusToColour, flash });
  } catch (err) {
    next(err);
  }
};

export const displayDatasetPreview = async (req: Request, res: Response) => {
  let pagination: (string | number)[] = [];
  let errors: ViewError[] | undefined;
  let datasetView: ViewDTO | undefined;
  let unProcessedFilelist: FileImportDto[] = [];
  let previewMetadata: PreviewMetadata | undefined = undefined;
  const datasetId = req.params.datasetId;

  try {
    const dataset = await req.pubapi.getDataset(datasetId, DatasetInclude.Developer);
    const revWithMeta = await req.pubapi.getRevision(datasetId, dataset.end_revision_id!);
    const revision = singleLangRevision(revWithMeta, req.language)!;
    const datasetStatus = getDatasetStatus(dataset);
    const publishingStatus = getPublishingStatus(dataset);
    const datasetTitle = revision?.metadata?.title || datasetId;
    const pageNumber = Number.parseInt(req.query.page_number as string, 10) || 1;
    const pageSize = Number.parseInt(req.query.page_size as string, 10) || 100;

    datasetView = await req.pubapi.getRevisionPreview(datasetId, revision.id, pageNumber, pageSize);
    previewMetadata = await getDatasetPreview(singleLangDataset(dataset, req.language), revision);
    pagination = generateSequenceForNumber(datasetView.current_page, datasetView.total_pages);
    logger.debug(`Sending request to backend for file list of dataset ${datasetId}...`);

    unProcessedFilelist = await req.pubapi.getDatasetFileList(datasetId);

    unProcessedFilelist = unProcessedFilelist.sort((fileA, fileB) => fileA.filename.localeCompare(fileB.filename));
    unProcessedFilelist.unshift({
      filename: t('developer.display.all_files', { lng: req.language }),
      mime_type: 'application/zip',
      file_type: 'zip',
      type: 'all',
      hash: '',
      parent_id: datasetId
    });

    const fileList: FileImportDto[][] = [];
    unProcessedFilelist.forEach((file: FileImportDto, index: number) => {
      switch (file.type) {
        case 'data_table':
          file.link = req.buildUrl(`/developer/${datasetId}/revision/${file.parent_id}/datatable`, req.language);
          break;
        case 'dimension':
          file.link = req.buildUrl(`/developer/${datasetId}/dimension/${file.parent_id}/lookup`, req.language);
          break;
        case 'measure':
          file.link = req.buildUrl(`/developer/${datasetId}/measure/lookup`, req.language);
          break;
        case 'all':
          file.link = req.buildUrl(`/developer/${datasetId}/download`, req.language);
          break;
      }
      if (index % 4 === 0) {
        fileList.push([file]);
      } else {
        fileList[fileList.length - 1].push(file);
      }
    });

    const datasetJson = hljs.highlight(JSON.stringify(dataset, null, 2), {
      language: 'json',
      ignoreIllegals: true
    }).value;

    res.render('consumer/view', {
      ...datasetView,
      datasetMetadata: previewMetadata,
      showDeveloperTab: true,
      datasetJson,
      fileList,
      dataset,
      pagination,
      errors,
      datasetStatus,
      publishingStatus,
      datasetTitle
    });
  } catch (error) {
    logger.error(error, `Failed to get developer preview data`);
    throw new UnknownException();
  }
};

export const downloadDataTableFromRevision = async (req: Request, res: Response, next: NextFunction) => {
  const datasetId = req.params.datasetId;

  try {
    const dataset = await req.pubapi.getDataset(datasetId, DatasetInclude.LatestRevision);
    const revision = dataset.end_revision;
    const dataTable = await req.pubapi.getRevisionDataTable(datasetId, dataset.end_revision_id!);

    if (!revision) {
      logger.error('Invalid or missing revisionId');
      next(new NotFoundException('errors.revision_missing'));
      return;
    }

    if (!dataTable) {
      logger.error('Invalid or missing data table');
      next(new NotFoundException('errors.data_table_missing'));
      return;
    }

    const attachmentName: string = dataTable.original_filename || revision.id;
    const headers = getDownloadHeaders(dataTable.file_type as FileFormat, attachmentName);

    if (!headers) {
      throw new NotFoundException('invalid file format');
    }
    const fileStream = await req.pubapi.getOriginalUpload(datasetId, revision.id);
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
  const datasetId = req.params.datasetId;
  const dimensionId = req.params.dimensionId;

  try {
    const dataset = await req.pubapi.getDataset(datasetId, DatasetInclude.Dimensions);
    const localisedDataset = singleLangDataset(dataset, req.language);
    const dimension = localisedDataset.dimensions?.find((dimension) => dimension.id === dimensionId);

    if (!dimension) {
      logger.error(`Invalid or missing Dimension ID, requested id is ${dimensionId}`);
      next(new NotFoundException('errors.dimension_missing'));
      return;
    }

    if (!dimension.lookupTable) {
      logger.error('Invalid or missing dimension lookup table');
      next(new NotFoundException('errors.dimension_lookup_missing'));
      return;
    }

    const lookupTable: LookupTableDTO = dimension.lookupTable;
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
  logger.debug(`Downloading all files for dataset ${req.params.datasetId}`);
  try {
    const dataset = await req.pubapi.getDataset(req.params.datasetId, DatasetInclude.LatestRevision);
    const latestRevision = singleLangDataset(dataset, req.language).end_revision;
    const datasetTitle = latestRevision?.metadata?.title || dataset.id;
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

export const rebuildCube = async (req: Request, res: Response, next: NextFunction) => {
  const datasetId = req.params.datasetId;

  try {
    const dataset = await req.pubapi.getDataset(datasetId);
    await req.pubapi.rebuildCube(datasetId, dataset.end_revision_id!);
    res.redirect(req.buildUrl(`/publish/${datasetId}/overview`, req.language));
  } catch (_err) {
    logger.error(_err, 'Error rebuilding the cube');
    next(new NotFoundException('errors.import_missing'));
  }
};
