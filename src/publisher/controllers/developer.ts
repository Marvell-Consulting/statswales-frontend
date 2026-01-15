import { Readable } from 'node:stream';

import { NextFunction, Request, Response } from 'express';

import { ResultsetWithCount } from '../../shared/interfaces/resultset-with-count';
import { DatasetListItemDTO } from '../../shared/dtos/dataset-list-item';
import { logger } from '../../shared/utils/logger';
import { ViewV2DTO } from '../../shared/dtos/view-dto';
import { NotFoundException } from '../../shared/exceptions/not-found.exception';
import { pageInfo } from '../../shared/utils/pagination';
import { singleLangDataset, singleLangRevision } from '../../shared/utils/single-lang-dataset';
import { getDatasetStatus, getPublishingStatus } from '../../shared/utils/dataset-status';
import { FileImportDto } from '../../shared/dtos/file-import';
import { FileFormat } from '../../shared/enums/file-format';
import { getDownloadHeaders } from '../../shared/utils/download-headers';
import { LookupTableDTO } from '../../shared/dtos/lookup-table';
import { getDatasetMetadata } from '../../shared/utils/dataset-metadata';
import { PreviewMetadata } from '../../shared/interfaces/preview-metadata';
import { ViewError } from '../../shared/dtos/view-error';
import { DatasetInclude } from '../../shared/enums/dataset-include';
import { SingleLanguageRevision } from '../../shared/dtos/single-language/revision';
import { FilterTable } from '../../shared/dtos/filter-table';
import { RevisionDTO } from '../../shared/dtos/revision';
import { DatasetStatus } from '../../shared/enums/dataset-status';
import { DataOptionsDTO, FRONTEND_DATA_OPTIONS } from '../../shared/interfaces/data-options';
import { markdownToSafeHTML } from '../../shared/utils/markdown-to-html';
import { parseFiltersV2, v2FiltersToV1 } from '../../shared/utils/parse-filters';
import { DEFAULT_PAGE_SIZE, parsePageOptions } from '../../shared/utils/parse-page-options';
import { SingleLanguageDataset } from '../../shared/dtos/single-language/dataset';
import { PublishingStatus } from '../../shared/enums/publishing-status';
import { processFileList, getDatasetJson } from '../utils/dev';
import { DatasetDTO } from '../../shared/dtos/dataset';

export const listAllDatasets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 20;
    const search = req.query.search as string | undefined;
    const results: ResultsetWithCount<DatasetListItemDTO> = await req.pubapi.getFullDatasetList(page, limit, search);
    const { data, count } = results;
    const pagination = pageInfo(page, limit, count);
    const flash = res.locals.flash;
    res.render('developer/list', { data, ...pagination, search, flash });
  } catch (err) {
    next(err);
  }
};

export const datasetPreview = async (req: Request, res: Response) => {
  const datasetId = req.params.datasetId;

  if (req.method === 'POST') {
    const dataOptions: DataOptionsDTO = { ...FRONTEND_DATA_OPTIONS, filters: parseFiltersV2(req.body.filter) };
    const filterId = await req.pubapi.generateFilterId(datasetId, dataOptions);
    const pageSize = Number.parseInt(req.body.page_size as string, 10) || DEFAULT_PAGE_SIZE;
    res.redirect(
      req.buildUrl(`/developer/${datasetId}/filtered/${filterId}`, req.language, { page_size: pageSize.toString() })
    );
    return;
  }

  let datasetDto: DatasetDTO;
  let dataset: SingleLanguageDataset;
  let revisionDto: RevisionDTO;
  let revision: SingleLanguageRevision;
  let datasetStatus: DatasetStatus;
  let publishingStatus: PublishingStatus;
  let datasetMetadata: PreviewMetadata | undefined;

  try {
    datasetDto = await req.pubapi.getDataset(datasetId, DatasetInclude.Developer);
    revisionDto = await req.pubapi.getRevision(datasetId, datasetDto.end_revision_id!);
    dataset = singleLangDataset(datasetDto, req.language);
    revision = singleLangRevision(revisionDto, req.language)!;
    datasetStatus = getDatasetStatus(datasetDto);
    publishingStatus = getPublishingStatus(datasetDto, revision);
    datasetMetadata = await getDatasetMetadata(dataset, revision);

    const { pageNumber, pageSize, sortBy } = parsePageOptions(req);
    const filterId = req.params.filterId;
    const datasetTitle = revision?.metadata?.title || datasetId;
    let pagination;
    let errors: ViewError[] | undefined;
    let previewFailed: string | undefined;
    let publishedRevisions: RevisionDTO[] = [];
    let fileList: FileImportDto[][] = [];
    let preview: ViewV2DTO | undefined;
    let filters: FilterTable[] = [];
    let datasetJson: string | undefined;

    // something here might fail, but we can still render the page without the preview
    try {
      const fetchPreview = filterId
        ? req.pubapi.getFilteredDatasetPreview(datasetId, filterId, pageNumber, pageSize, sortBy)
        : req.pubapi.getDatasetPreview(datasetId, pageNumber, pageSize, sortBy);

      [preview, filters, publishedRevisions] = await Promise.all([
        fetchPreview,
        req.pubapi.getRevisionFilters(datasetId, revision.id),
        req.pubapi.getPublicationHistory(datasetId)
      ]);

      pagination = pageInfo(preview.page_info?.current_page, pageSize, preview.page_info?.total_records || 0);

      const publicationHistory = [revisionDto, ...publishedRevisions].map((rev) =>
        singleLangRevision(rev, req.language)
      );

      for (const rev of publicationHistory) {
        if (rev?.metadata?.reason) {
          rev.metadata.reason = await markdownToSafeHTML(rev.metadata.reason);
        }
      }
      const files = await req.pubapi.getDatasetFileList(datasetId);
      fileList = processFileList(datasetId, files, req.language);
      datasetJson = getDatasetJson(dataset);
    } catch (err: any) {
      // might not be able to render some parts of the page, but continue anyway
      logger.error(err, `Failed to fetch the cube preview for dataset ${datasetId} and revision ${revision.id}`);
      previewFailed = err.message;
    }

    res.render('dataset-preview', {
      isDevPreview: true,
      ...preview,
      ...pagination,
      datasetMetadata,
      filters,
      dataset,
      errors,
      publishedRevisions,
      datasetJson,
      fileList,
      datasetStatus,
      publishingStatus,
      datasetTitle,
      previewFailed,
      selectedFilterOptions: preview?.filters ? v2FiltersToV1(preview.filters) : [],
      shorthandUrl: req.buildUrl(`/shorthand`, req.language)
    });
  } catch (err) {
    // can't really recover from here as there's no dataset or revision
    logger.error(err, `Failed to get basic info for dataset ${datasetId}`);
    throw new NotFoundException('errors.dataset_missing');
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
      next(new NotFoundException('errors.revision_missing'));
      return;
    }
    const dataTable = await req.pubapi.getRevisionDataTable(datasetId, revisionId);

    if (!dataTable) {
      next(new NotFoundException('errors.data_table_missing'));
      return;
    }

    const attachmentName: string = dataTable.original_filename || revisionId;
    const headers = getDownloadHeaders(dataTable.file_type as FileFormat, attachmentName);
    const fileStream = await req.pubapi.getOriginalUpload(datasetId, revisionId);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (_err) {
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
    next(new NotFoundException('errors.measure_missing'));
    return;
  }
  const lookupTable: LookupTableDTO | undefined = measure!.lookup_table;
  if (!lookupTable) {
    next(new NotFoundException('errors.lookup_table_missing'));
    return;
  }
  try {
    const attachmentName: string = lookupTable.original_filename || dataset.id;
    const headers = getDownloadHeaders(lookupTable.file_type as FileFormat, attachmentName);
    const fileStream = await req.pubapi.getOriginalUploadMeasure(dataset.id);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (_err) {
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
      next(new NotFoundException('errors.dimension_missing'));
      return;
    }

    if (!dimension.lookupTable) {
      next(new NotFoundException('errors.dimension_lookup_missing'));
      return;
    }

    const lookupTable: LookupTableDTO = dimension.lookupTable;
    const attachmentName: string = lookupTable.original_filename || dimension.id;
    const headers = getDownloadHeaders(lookupTable.file_type as FileFormat, attachmentName);
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
    const headers = getDownloadHeaders(FileFormat.Zip, datasetTitle);
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
