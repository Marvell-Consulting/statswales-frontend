import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';

import { Request, Response, NextFunction } from 'express';
import { omit } from 'lodash';
import slugify from 'slugify';
import { stringify } from 'csv-stringify/sync';

import { DatasetListItemDTO } from '../../shared/dtos/dataset-list-item';
import { ResultsetWithCount } from '../../shared/interfaces/resultset-with-count';
import { pageInfo } from '../../shared/utils/pagination';
import { singleLangPublishedDataset, singleLangRevision } from '../../shared/utils/single-lang-dataset';
import { getDatasetMetadata, metadataToCSV } from '../../shared/utils/dataset-metadata';
import { NotFoundException } from '../../shared/exceptions/not-found.exception';
import { BadRequestException } from '../../shared/exceptions/bad-request.exception';
import { FileFormat } from '../../shared/enums/file-format';
import { getDownloadHeaders } from '../../shared/utils/download-headers';
import { logger } from '../../shared/utils/logger';
import { Locale } from '../../shared/enums/locale';
import { config } from '../../shared/config';
import { SortByInterface } from '../../shared/interfaces/sort-by';
import { TopicDTO } from '../../shared/dtos/topic';
import { parseFilters, parseFiltersV2, v1FiltersToV2, v2FiltersToV1 } from '../../shared/utils/parse-filters';
import { FilterTable } from '../../shared/dtos/filter-table';
import { ViewV2DTO } from '../../shared/dtos/view-dto';
import { PreviewMetadata } from '../../shared/interfaces/preview-metadata';
import { singleLangTopic } from '../../shared/utils/single-lang-topic';
import { RevisionDTO } from '../../shared/dtos/revision';
import { markdownToSafeHTML } from '../../shared/utils/markdown-to-html';
import { Filter, FilterV2 } from '../../shared/interfaces/filter';
import { getDownloadFilename } from '../../shared/utils/download-filename';
import { DataOptionsDTO, FRONTEND_DATA_OPTIONS } from '../../shared/interfaces/data-options';
import { DataValueType } from '../../shared/enums/data-value-type';
import { DEFAULT_PAGE_SIZE, parsePageOptions } from '../../shared/utils/parse-page-options';
import { SearchMode } from '../../shared/enums/search-mode';
import {
  getErrors,
  viewTypeValidator,
  formatValidator,
  downloadLanguageValidator,
  viewChoiceValidator,
  extendedValidator
} from '../../shared/validators';
import { FieldValidationError } from 'express-validator';
import { SearchResultDTO } from '../../shared/dtos/search-result';
import { sanitizeSearchResults } from '../../shared/utils/sanitize-search-results';
import { PivotStage } from '../../shared/enums/pivot-stage';

export const listTopics = async (req: Request, res: Response, next: NextFunction) => {
  const topicId = req.params.topicId ? req.params.topicId.match(/\d+/)?.[0] : undefined;
  const pageNumber = parseInt(req.query.page_number as string, 10) || 1;
  const pageSize = parseInt(req.query.page_size as string, 10) || 20;

  interface SortOptions extends SortByInterface {
    value: string;
  }

  const sortOptions: SortOptions[] = [
    { value: 'title_a_to_z', columnName: 'title', direction: 'ASC' },
    { value: 'title_z_to_a', columnName: 'title', direction: 'DESC' },
    { value: 'first_published', columnName: 'first_published_at', direction: 'DESC' },
    { value: 'last_updated', columnName: 'last_updated_at', direction: 'DESC' }
  ];

  // if we don't find a match, default to 'last_updated'
  const sortBy = sortOptions.find((option) => option.value === (req.query.sort_by as string)) || sortOptions[3];

  try {
    const { selectedTopic, children, parents, datasets } = await req.conapi.getPublishedTopics(
      topicId,
      pageNumber,
      pageSize,
      sortBy ? omit(sortBy, 'value') : undefined
    );

    // add slug for friendlier URLs
    const childTopics =
      children?.map((topic: TopicDTO) => ({ ...topic, slug: slugify(topic.name, { lower: true }) })) || [];

    const parentTopics =
      parents?.map((topic: TopicDTO) => ({ ...topic, slug: slugify(topic.name, { lower: true }) })) || [];

    const consumerApiUrl = `${config.backend.url}/v1/docs`;

    const { data, count } = datasets || { data: [], count: 0 };
    const pagination = pageInfo(pageNumber, pageSize, count);

    res.render('topic-list', {
      selectedTopic,
      childTopics,
      parentTopics,
      datasets: data,
      ...pagination,
      consumerApiUrl,
      sortBy,
      sortOptions
    });
  } catch (err) {
    next(err);
  }
};

export const listPublishedDatasets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 10;
    const results: ResultsetWithCount<DatasetListItemDTO> = await req.conapi.getPublishedDatasetList(page, limit);

    const { data, count } = results;
    const pagination = pageInfo(page, limit, count);

    res.render('list', { data, count, ...pagination, hide_pagination_hint: true });
  } catch (err) {
    next(err);
  }
};

export const viewPublishedDataset = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangPublishedDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;
  const isUnpublished = revision?.unpublished_at || false;
  const isArchived = (dataset.archived_at && dataset.archived_at < new Date().toISOString()) || false;
  const { pageNumber, pageSize, sortBy } = parsePageOptions(req);

  if (!revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  const [datasetMetadata, view, filters, publishedRevisions]: [
    PreviewMetadata,
    ViewV2DTO,
    FilterTable[],
    RevisionDTO[]
  ] = await Promise.all([
    getDatasetMetadata(dataset, revision),
    req.conapi.getPublishedDatasetView(dataset.id, pageNumber, pageSize, sortBy),
    req.conapi.getPublishedDatasetFilters(dataset.id),
    req.conapi.getPublicationHistory(dataset.id)
  ]);

  const topics = dataset.published_revision?.topics?.map((topic) => singleLangTopic(topic, req.language)) || [];
  const pagination = pageInfo(view.page_info?.current_page, pageSize, view.page_info?.total_records || 0);
  const publicationHistory = publishedRevisions.map((rev) => singleLangRevision(rev, req.language));

  for (const rev of publicationHistory) {
    if (rev?.metadata?.reason) {
      rev.metadata.reason = await markdownToSafeHTML(rev.metadata.reason);
    }
  }

  res.render('dataset/view', {
    ...view,
    ...pagination,
    datasetMetadata,
    filters,
    topics,
    publicationHistory,
    selectedFilterOptions: [],
    shorthandUrl: req.buildUrl(`/shorthand`, req.language),
    isUnpublished,
    isArchived,
    replacedBy: dataset.replaced_by,
    sortBy
  });
};

export const viewFilteredDataset = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangPublishedDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  if (!revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  if (req.method === 'POST') {
    const pageSize = Number.parseInt(req.body.page_size as string, 10) || DEFAULT_PAGE_SIZE;
    const parsedFilters = parseFilters(req.body.filter);
    const filters = await req.conapi.getPublishedDatasetFilters(dataset.id);

    const allSelectedCols = new Set(Object.keys((req.body.filter_all as Record<string, string>) ?? {}));
    const emptyFilterColumns = filters.filter(
      (f) => !allSelectedCols.has(f.factTableColumn) && !parsedFilters.some((p) => p.columnName === f.factTableColumn)
    );

    if (emptyFilterColumns.length > 0) {
      req.session.errors = emptyFilterColumns.map((f) => ({
        field: `filter[${f.factTableColumn}]`,
        message: { key: 'filters.no_values_selected', params: { columnName: f.columnName } }
      }));
      req.session.save();
      const fallback = req.buildUrl(`/${dataset.id}`, req.language, {}, 'dataset-nav');
      res.redirect(req.headers.referer ?? fallback);
      return;
    }

    const dataOptions: DataOptionsDTO = { ...FRONTEND_DATA_OPTIONS, filters: parseFiltersV2(req.body.filter) };
    const filterId = await req.conapi.generateFilterId(dataset.id, dataOptions);
    res.redirect(
      req.buildUrl(
        `/${dataset.id}/filtered/${filterId}`,
        req.language,
        { page_size: pageSize.toString() },
        'dataset-nav'
      )
    );
    return;
  }

  const filterId = req.params.filterId;

  if (!filterId) {
    next(new NotFoundException('filter id is required'));
    return;
  }

  const { pageNumber, pageSize, sortBy } = parsePageOptions(req);

  const [datasetMetadata, view, filters, publishedRevisions]: [
    PreviewMetadata,
    ViewV2DTO,
    FilterTable[],
    RevisionDTO[]
  ] = await Promise.all([
    getDatasetMetadata(dataset, revision),
    req.conapi.getFilteredDatasetView(dataset.id, filterId, pageNumber, pageSize, sortBy),
    req.conapi.getPublishedDatasetFilters(dataset.id),
    req.conapi.getPublicationHistory(dataset.id)
  ]);

  const topics = dataset.published_revision?.topics?.map((topic) => singleLangTopic(topic, req.language)) || [];
  const pagination = pageInfo(view.page_info?.current_page, pageSize, view.page_info?.total_records || 0);
  const publicationHistory = publishedRevisions.map((rev) => singleLangRevision(rev, req.language));

  for (const rev of publicationHistory) {
    if (rev?.metadata?.reason) {
      rev.metadata.reason = await markdownToSafeHTML(rev.metadata.reason);
    }
  }

  res.render('dataset/view', {
    ...view,
    ...pagination,
    datasetMetadata,
    filters,
    topics,
    publicationHistory,
    selectedFilterOptions: view.filters ? v2FiltersToV1(view.filters) : [],
    shorthandUrl: req.buildUrl(`/shorthand`, req.language),
    isUnpublished: revision?.unpublished_at || false,
    isArchived: (dataset.archived_at && dataset.archived_at < new Date().toISOString()) || false,
    replacedBy: dataset.replaced_by,
    sortBy
  });
};

export const downloadPublishedDataset = async (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Downloading published dataset ${res.locals.datasetId}`);
  const dataset = singleLangPublishedDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  try {
    if (!dataset.first_published_at || !revision) {
      throw new NotFoundException('no published revision found');
    }

    if (req.method === 'POST') {
      const validators = [
        viewTypeValidator(),
        formatValidator(),
        downloadLanguageValidator(),
        viewChoiceValidator(),
        extendedValidator()
      ];

      const errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
        return { field: error.path, message: error.msg };
      });

      if (errors.length > 0) {
        logger.error(errors, 'Validation errors in download form');
        const errorMessage = errors.map((e) => `${e.field}: ${e.message}`).join(', ');
        return next(new BadRequestException(errorMessage));
      }

      let filters: FilterV2[] = [];

      if (req.body.view_type === 'filtered' && req.body.selected_filter_options) {
        const selectedFilters = JSON.parse(req.body.selected_filter_options) as Filter[];
        filters = v1FiltersToV2(selectedFilters);
      }

      const format = req.body.format as FileFormat;
      const download_language = req.body.download_language as Locale;
      const viewChoice = req.body.view_choice as string;
      const includeExtended = (req.body.extended ?? 'no') as string;
      const data_value_type = (`${viewChoice}` + `${includeExtended === 'yes' ? '_extended' : ''}`) as DataValueType;

      const sanitizePivotAxis = (value: unknown): string[] => {
        const raw = Array.isArray(value) ? value : [value];
        const trimmed = raw
          .map((v) => (typeof v === 'string' ? v.trim() : ''))
          .filter((v): v is string => v.length > 0);
        return Array.from(new Set(trimmed));
      };

      let pivot = 'false';
      let filterId: string;

      const pivotRows = sanitizePivotAxis(req.body.rows);
      const pivotColumns = sanitizePivotAxis(req.body.columns);
      const hasValidPivotAxes =
        req.body.view_type === 'filtered' &&
        pivotRows.length > 0 &&
        pivotColumns.length > 0 &&
        !pivotRows.some((row) => pivotColumns.includes(row));

      if (hasValidPivotAxes) {
        pivot = 'true';
        const dataOptions: DataOptionsDTO = {
          filters,
          pivot: { x: pivotColumns[0], y: pivotRows[0], include_performance: false, backend: 'duckdb' },
          options: {
            use_raw_column_names: true,
            use_reference_values: true,
            data_value_type
          }
        };
        filterId = await req.conapi.generatePivotFilterId(dataset.id, dataOptions);
      } else {
        const dataOptions: DataOptionsDTO = {
          filters,
          options: {
            use_raw_column_names: true,
            use_reference_values: true,
            data_value_type
          }
        };
        filterId = await req.conapi.generateFilterId(dataset.id, dataOptions);
      }

      res.redirect(
        req.buildUrl(`/${dataset.id}/download/${filterId}`, req.language, { format, download_language, pivot })
      );
      return;
    }

    const filterId = req.params.filterId;
    const format = (req.query.format as FileFormat) || FileFormat.Csv;
    const download_language = (req.query.download_language?.toString() || req.language) as Locale;

    if (!filterId) {
      next(new NotFoundException('filter id is required'));
      return;
    }

    const filename = getDownloadFilename(dataset.id, revision, download_language);
    const headers = getDownloadHeaders(format, filename);
    let fileStream: ReadableStream<any>;
    if (req.query.pivot === 'true') {
      logger.debug('Getting pivot download');
      fileStream = await req.conapi.downloadPublishedPivotData(dataset.id, filterId, format, download_language);
    } else {
      logger.debug('Getting data download');
      fileStream = await req.conapi.downloadPublishedData(dataset.id, filterId, format, download_language);
    }
    res.writeHead(200, headers);
    Readable.from(fileStream).pipe(res);
  } catch (err) {
    next(err);
  }
};

export const downloadPublishedMetadata = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug('downloading published dataset metadata');
  const dataset = singleLangPublishedDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  if (!dataset.first_published_at || !revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  try {
    const metadata = await getDatasetMetadata(dataset, revision, false);
    const downloadMeta = metadataToCSV(metadata, req.language as Locale);
    const headers = getDownloadHeaders(FileFormat.Csv, `${metadata.title}-meta`);
    res.set(headers);
    res.send(stringify(downloadMeta, { bom: true, header: false, quoted: true }));
  } catch (err) {
    next(err);
  }
};

export const search = async (req: Request, res: Response) => {
  const keywords = req.query.keywords as string;
  const mode = SearchMode.FTSSimple;
  const page = parseInt(req.query.page_number as string, 10) || 1;
  const limit = 20;

  if (keywords) {
    try {
      logger.info(`searching published datasets for: '${keywords}' using mode: ${mode}`);
      const resultSet: ResultsetWithCount<SearchResultDTO> = await req.conapi.search(mode, keywords, page, limit);
      const { data, count } = resultSet;
      const results = sanitizeSearchResults(data);
      const pagination = pageInfo(page, limit, count);

      res.render('search', { keywords, results, count, ...pagination });
      return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      logger.error(err, 'Error occurred during search');
    }
  }

  res.render('search', { mode, keywords, results: undefined, count: undefined });
};

export const viewPublishedLanding = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangPublishedDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;
  const isUnpublished = revision?.unpublished_at || false;
  const isArchived = (dataset.archived_at && dataset.archived_at < new Date().toISOString()) || false;

  if (!revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  try {
    if (req.method === 'POST') {
      switch (req.body.chooser) {
        case 'pivot':
          res.redirect(req.buildUrl(`/${dataset.id}/pivot`, req.language, undefined, 'dataset-nav'));
          return;
        case 'data':
          res.redirect(req.buildUrl(`/${dataset.id}/data`, req.language, undefined, 'dataset-nav'));
          return;
        default:
          throw new BadRequestException('Unsupported chooser type');
      }
    }

    const [datasetMetadata, filters, publishedRevisions]: [PreviewMetadata, FilterTable[], RevisionDTO[]] =
      await Promise.all([
        getDatasetMetadata(dataset, revision),
        req.conapi.getPublishedDatasetFilters(dataset.id),
        req.conapi.getPublicationHistory(dataset.id)
      ]);

    const topics = dataset.published_revision?.topics?.map((topic) => singleLangTopic(topic, req.language)) || [];
    const publicationHistory = publishedRevisions.map((rev) => singleLangRevision(rev, req.language));

    for (const rev of publicationHistory) {
      if (rev?.metadata?.reason) {
        rev.metadata.reason = await markdownToSafeHTML(rev.metadata.reason);
      }
    }

    res.render('dataset/landing', {
      datasetMetadata,
      filters,
      topics,
      publicationHistory,
      selectedFilterOptions: [],
      shorthandUrl: req.buildUrl(`/shorthand`, req.language),
      isUnpublished,
      isArchived,
      replacedBy: dataset.replaced_by,
      isLanding: true,
      pivotStage: PivotStage.Landing
    });
  } catch (err) {
    next(err);
  }
};

export const createPublishedDatasetPivot = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangPublishedDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;
  const isUnpublished = revision?.unpublished_at || false;
  const isArchived = (dataset.archived_at && dataset.archived_at < new Date().toISOString()) || false;
  let pivotStage: PivotStage;

  if (!revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  if (req.method === 'POST') {
    const { columns, rows } = req.body;

    if (typeof columns !== 'string' || typeof rows !== 'string' || !columns.trim() || !rows.trim()) {
      next(new BadRequestException('Both "columns" and "rows" must be non-empty strings.'));
      return;
    }

    if (columns.trim() === rows.trim()) {
      next(new BadRequestException('"columns" and "rows" must be different values.'));
      return;
    }
    const trimmedColumns = columns.trim();
    const trimmedRows = rows.trim();

    const availableFilters: FilterTable[] = await req.conapi.getPublishedDatasetFilters(dataset.id);
    const validColumnNames = new Set(availableFilters.map((f) => f.factTableColumn));

    if (!validColumnNames.has(trimmedColumns) || !validColumnNames.has(trimmedRows)) {
      next(new BadRequestException('Both "columns" and "rows" must match valid filter column names.'));
      return;
    }

    const parsedFilters = parseFilters(req.body.filter);
    const allSelectedCols = new Set(Object.keys((req.body.filter_all as Record<string, string>) ?? {}));
    const emptyFilterColumns = availableFilters.filter(
      (f) => !allSelectedCols.has(f.factTableColumn) && !parsedFilters.some((p) => p.columnName === f.factTableColumn)
    );

    if (emptyFilterColumns.length > 0) {
      req.session.errors = emptyFilterColumns.map((f) => ({
        field: `filter[${f.factTableColumn}]`,
        message: { key: 'filters.no_values_selected', params: { columnName: f.columnName } }
      }));
      req.session.save();
      const fallback = req.buildUrl(`/${dataset.id}/pivot`, req.language, {}, 'dataset-nav');
      res.redirect(req.headers.referer ?? fallback);
      return;
    }

    const dataOptions: DataOptionsDTO = {
      ...FRONTEND_DATA_OPTIONS,
      filters: parseFiltersV2(req.body.filter),
      pivot: { x: trimmedColumns, y: trimmedRows, include_performance: false, backend: 'duckdb' }
    };
    const filterId = await req.conapi.generatePivotFilterId(dataset.id, dataOptions);
    const pageSize = Number.parseInt(req.body.page_size as string, 10) || DEFAULT_PAGE_SIZE;
    if (req.body.stage === PivotStage.Summary) {
      res.redirect(
        req.buildUrl(
          `/${dataset.id}/pivot/${filterId}/summary`,
          req.language,
          { page_size: pageSize.toString() },
          'dataset-nav'
        )
      );
      return;
    }
    res.redirect(
      req.buildUrl(`/${dataset.id}/pivot/${filterId}`, req.language, { page_size: pageSize.toString() }, 'dataset-nav')
    );
    return;
  } else {
    if (req.query?.columns && req.query?.rows) {
      pivotStage = PivotStage.Summary;
    } else if (req.query?.columns) {
      pivotStage = PivotStage.Rows;
    } else {
      pivotStage = PivotStage.Columns;
    }
  }

  try {
    const [datasetMetadata, filters, publishedRevisions]: [PreviewMetadata, FilterTable[], RevisionDTO[]] =
      await Promise.all([
        getDatasetMetadata(dataset, revision),
        req.conapi.getPublishedDatasetFilters(dataset.id),
        req.conapi.getPublicationHistory(dataset.id)
      ]);

    const topics = dataset.published_revision?.topics?.map((topic) => singleLangTopic(topic, req.language)) || [];
    const publicationHistory = publishedRevisions.map((rev) => singleLangRevision(rev, req.language));

    for (const rev of publicationHistory) {
      if (rev?.metadata?.reason) {
        rev.metadata.reason = await markdownToSafeHTML(rev.metadata.reason);
      }
    }

    let selectedFilterOptions: Filter[] = [];
    if (req.query.rows && req.query.columns) {
      selectedFilterOptions = filters
        .filter((f) => f.factTableColumn !== req.query.rows && f.factTableColumn !== req.query.columns)
        .filter((f) => f.values.length > 0)
        .map((f) => {
          return {
            columnName: f.factTableColumn,
            values: [f.values[0].reference]
          };
        });
    }

    res.render('dataset/landing', {
      datasetMetadata,
      filters,
      topics,
      publicationHistory,
      selectedFilterOptions,
      shorthandUrl: req.buildUrl(`/shorthand`, req.language),
      isUnpublished,
      isArchived,
      replacedBy: dataset.replaced_by,
      pivotStage,
      columns: req.query.columns,
      rows: req.query.rows
    });
  } catch (err) {
    next(err);
  }
};

export const viewPivotedDatasetSummary = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangPublishedDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  if (!revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  const isUnpublished = !!revision.unpublished_at;
  const isArchived = !!dataset.archived_at;

  try {
    const filterId = req.params.filterId;

    if (!filterId) {
      next(new NotFoundException('filter id is required'));
      return;
    }

    const [datasetMetadata, view, filters, publishedRevisions]: [
      PreviewMetadata,
      ViewV2DTO,
      FilterTable[],
      RevisionDTO[]
    ] = await Promise.all([
      getDatasetMetadata(dataset, revision),
      req.conapi.getPivotedDatasetView(dataset.id, filterId, 1, 1),
      req.conapi.getPublishedDatasetFilters(dataset.id),
      req.conapi.getPublicationHistory(dataset.id)
    ]);

    const topics =
      dataset.published_revision?.topics?.map((topic: TopicDTO) => singleLangTopic(topic, req.language)) || [];
    const publicationHistory = publishedRevisions.map((rev) => singleLangRevision(rev, req.language));

    for (const rev of publicationHistory) {
      if (rev?.metadata?.reason) {
        rev.metadata.reason = await markdownToSafeHTML(rev.metadata.reason);
      }
    }

    res.render('dataset/landing', {
      ...view,
      datasetMetadata,
      filters,
      topics,
      publicationHistory,
      selectedFilterOptions: view.filters ? v2FiltersToV1(view.filters) : [],
      shorthandUrl: req.buildUrl(`/shorthand`, req.language),
      isUnpublished,
      isArchived,
      pivotStage: PivotStage.Summary,
      columns: view.pivot?.x,
      rows: view.pivot?.y
    });
  } catch (err) {
    next(err);
  }
};

export const viewPivotedDataset = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangPublishedDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  if (!revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  try {
    const filterId = req.params.filterId;

    if (!filterId) {
      next(new NotFoundException('filter id is required'));
      return;
    }

    const { pageNumber, pageSize, sortBy } = parsePageOptions(req);

    const [datasetMetadata, view, filters, publishedRevisions]: [
      PreviewMetadata,
      ViewV2DTO,
      FilterTable[],
      RevisionDTO[]
    ] = await Promise.all([
      getDatasetMetadata(dataset, revision),
      req.conapi.getPivotedDatasetView(dataset.id, filterId, pageNumber, pageSize, sortBy),
      req.conapi.getPublishedDatasetFilters(dataset.id),
      req.conapi.getPublicationHistory(dataset.id)
    ]);

    const topics = dataset.published_revision?.topics?.map((topic) => singleLangTopic(topic, req.language)) || [];
    const pagination = pageInfo(view.page_info?.current_page, pageSize, view.page_info?.total_records || 0);
    const publicationHistory = publishedRevisions.map((rev) => singleLangRevision(rev, req.language));

    for (const rev of publicationHistory) {
      if (rev?.metadata?.reason) {
        rev.metadata.reason = await markdownToSafeHTML(rev.metadata.reason);
      }
    }

    res.render('dataset/view', {
      ...view,
      ...pagination,
      datasetMetadata,
      filters,
      topics,
      publicationHistory,
      selectedFilterOptions: view.filters ? v2FiltersToV1(view.filters) : [],
      shorthandUrl: req.buildUrl(`/shorthand`, req.language),
      isUnpublished: revision?.unpublished_at || false,
      isArchived: (dataset.archived_at && dataset.archived_at < new Date().toISOString()) || false,
      replacedBy: dataset.replaced_by,
      filterId,
      columns: view.pivot?.x,
      rows: view.pivot?.y,
      sortBy
    });
  } catch (err) {
    next(err);
  }
};
