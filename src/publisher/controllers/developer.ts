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
import { paginationSequence, pageInfo } from '../../shared/utils/pagination';
import { singleLangDataset, singleLangRevision } from '../../shared/utils/single-lang-dataset';
import { statusToColour } from '../../shared/utils/status-to-colour';
import { getDatasetStatus, getPublishingStatus } from '../../shared/utils/dataset-status';
import { FileImportDto } from '../../shared/dtos/file-import';
import { FileFormat } from '../../shared/enums/file-format';
import { getDownloadHeaders } from '../../shared/utils/download-headers';
import { LookupTableDTO } from '../../shared/dtos/lookup-table';
import { getDatasetMetadata } from '../../shared/utils/dataset-metadata';
import { PreviewMetadata } from '../../shared/interfaces/preview-metadata';
import { ViewError } from '../../shared/dtos/view-error';
import { DatasetInclude } from '../../shared/enums/dataset-include';
import { UnknownException } from '../../shared/exceptions/unknown.exception';
import { SingleLanguageRevision } from '../../shared/dtos/single-language/revision';
import { DatasetDTO } from '../../shared/dtos/dataset';
import { ApiException } from '../../shared/exceptions/api.exception';
import { CubeBuildResult } from '../../shared/dtos/cube-build-result';

export const listAllDatasets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 20;
    const search = req.query.search as string | undefined;
    const results: ResultsetWithCount<DatasetListItemDTO> = await req.pubapi.getFullDatasetList(page, limit, search);
    const { data, count } = results;
    const pagination = pageInfo(page, limit, count);
    const flash = res.locals.flash;
    res.render('developer/list', { data, ...pagination, search, statusToColour, flash });
  } catch (err) {
    next(err);
  }
};

export const displayDatasetPreview = async (req: Request, res: Response) => {
  const datasetId = req.params.datasetId;
  let dataset: DatasetDTO;
  let revision: SingleLanguageRevision;
  let pagination: (string | number)[] = [];
  let errors: ViewError[] | undefined;
  let datasetView: ViewDTO | undefined;
  let unProcessedFilelist: FileImportDto[] = [];
  let datasetMetadata: PreviewMetadata | undefined = undefined;
  let previewFailed: boolean | string = false;

  try {
    dataset = await req.pubapi.getDataset(datasetId, DatasetInclude.Developer);
    const revWithMeta = await req.pubapi.getRevision(datasetId, dataset.end_revision_id!);
    revision = singleLangRevision(revWithMeta, req.language)!;
  } catch (err) {
    // can't really recover from this if there's no dataset or revision
    logger.error(err, `Failed to get basic info for dataset ${datasetId}`);
    throw new NotFoundException('errors.dataset_missing');
  }

  try {
    const pageNumber = Number.parseInt(req.query.page_number as string, 10) || 1;
    const pageSize = Number.parseInt(req.query.page_size as string, 10) || 100;
    datasetView = await req.pubapi.getRevisionPreview(datasetId, revision.id, pageNumber, pageSize);
    pagination = paginationSequence(datasetView.current_page, datasetView.total_pages);
  } catch (err: any) {
    logger.error(err, `Failed to fetch the cube preview for dataset ${datasetId} and revision ${revision.id}`);
    previewFailed = err.message; // carry on, but without the cube preview
  }

  try {
    const datasetStatus = getDatasetStatus(dataset);
    const publishingStatus = getPublishingStatus(dataset);
    const datasetTitle = revision?.metadata?.title || datasetId;
    datasetMetadata = await getDatasetMetadata(singleLangDataset(dataset, req.language), revision);
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

    res.render('dataset-view', {
      ...datasetView,
      datasetMetadata,
      showDeveloperTab: true,
      datasetJson,
      fileList,
      dataset,
      pagination,
      errors,
      datasetStatus,
      publishingStatus,
      datasetTitle,
      previewFailed
    });
  } catch (error) {
    logger.error(error, `Failed to get developer preview data`);
    throw new UnknownException();
  }
};

export const downloadDataTableFromRevision = async (req: Request, res: Response, next: NextFunction) => {
  const datasetId = req.params.datasetId;
  const revisionId = req.params.revisionId;

  try {
    const dataset = await req.pubapi.getDataset(datasetId, DatasetInclude.LatestRevision);
    if (!dataset) {
      next(new NotFoundException('errors.dataset_missing'));
      return;
    }

    if (!revisionId) {
      logger.error('Invalid or missing revisionId');
      next(new NotFoundException('errors.revision_missing'));
      return;
    }
    const dataTable = await req.pubapi.getRevisionDataTable(datasetId, revisionId);

    if (!dataTable) {
      logger.error('Invalid or missing data table');
      next(new NotFoundException('errors.data_table_missing'));
      return;
    }

    const attachmentName: string = dataTable.original_filename || revisionId;
    const headers = getDownloadHeaders(dataTable.file_type as FileFormat, attachmentName);

    if (!headers) {
      throw new NotFoundException('invalid file format');
    }
    const fileStream = await req.pubapi.getOriginalUpload(datasetId, revisionId);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (_err) {
    logger.error(_err, 'Error downloading data table');
    next(new NotFoundException('errors.import_missing'));
  }
};

export const downloadLookupFileFromMeasure = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = await req.pubapi.getDataset(req.params.datasetId, DatasetInclude.Measure);
  if (!dataset) {
    next(new NotFoundException('errors.dataset_missing'));
    return;
  }
  const measure = dataset.measure;

  if (!measure && !measure!.lookup_table) {
    logger.error('Invalid or missing measure');
    next(new NotFoundException('errors.measure_missing'));
    return;
  }
  const lookupTable: LookupTableDTO | undefined = measure!.lookup_table;
  if (!lookupTable) {
    logger.error('Invalid or missing lookup table');
    next(new NotFoundException('errors.lookup_table_missing'));
    return;
  }
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
  let errors: ViewError[] = [];
  const datasetId = req.params.datasetId;
  const canMoveGroup = false;
  const canEdit = false;
  const canApprove = true;
  const startTime = new Date();

  let cubeBuildResult: CubeBuildResult;
  const flash: string[] = [];
  try {
    const dataset = await req.pubapi.getDataset(datasetId);
    cubeBuildResult = await req.pubapi.rebuildCube(datasetId, dataset.end_revision_id!);
    flash.push('publish.overview.build.success');
  } catch (err) {
    logger.error(err, 'Error rebuilding the cube');
    if ((err as CubeBuildResult).total_time) {
      cubeBuildResult = err as CubeBuildResult;
    } else {
      // Prefer results from backend but if missing use local times
      cubeBuildResult = {
        start_time: startTime,
        finish_time: new Date(),
        total_time: '?',
        message: 'publish.overview.build.failed',
        error: err as Error
      };
    }
    errors = [{ field: 'build', message: { key: 'publish.overview.build.failed' } }];
  }
  if (cubeBuildResult.error) {
    cubeBuildResult.error = hljs.highlight(JSON.stringify(cubeBuildResult.error, null, 2), {
      language: 'json',
      ignoreIllegals: true
    }).value;
  }

  try {
    const [dataset, history] = await Promise.all([
      req.pubapi.getDataset(datasetId, DatasetInclude.Overview),
      req.pubapi.getDatasetHistory(datasetId)
    ]);

    const revision = singleLangRevision(dataset.end_revision, req.language)!;

    const title = revision?.metadata?.title;
    const datasetStatus = getDatasetStatus(dataset);
    const publishingStatus = getPublishingStatus(dataset, revision);
    const openTasks = dataset.tasks?.filter((task) => task.open) || [];

    res.render('publish/overview/overview', {
      dataset,
      datasetId,
      revision,
      title,
      datasetStatus,
      publishingStatus,
      canMoveGroup,
      canEdit,
      canApprove,
      openTasks,
      history,
      cubeBuildResult,
      isDeveloper: true,
      flash,
      errors
    });
    return;
  } catch (err) {
    if (err instanceof ApiException) {
      logger.error(err, `Failed to fetch the dataset overview`);
      next(new NotFoundException());
      return;
    }
  }
};
