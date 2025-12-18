import { Readable } from 'node:stream';

import { Request, Response, NextFunction } from 'express';
import { omit } from 'lodash';
import slugify from 'slugify';
import { stringify } from 'csv-stringify/sync';

import { DatasetListItemDTO } from '../../shared/dtos/dataset-list-item';
import { ResultsetWithCount } from '../../shared/interfaces/resultset-with-count';
import { pageInfo } from '../../shared/utils/pagination';
import { singleLangDataset, singleLangRevision } from '../../shared/utils/single-lang-dataset';
import { getDatasetMetadata, metadataToCSV } from '../../shared/utils/dataset-metadata';
import { NotFoundException } from '../../shared/exceptions/not-found.exception';
import { FileFormat } from '../../shared/enums/file-format';
import { getDownloadHeaders } from '../../shared/utils/download-headers';
import { logger } from '../../shared/utils/logger';
import { Locale } from '../../shared/enums/locale';
import { config } from '../../shared/config';
import { SortByInterface } from '../../shared/interfaces/sort-by';
import { TopicDTO } from '../../shared/dtos/topic';
import { parseFiltersV2 } from '../../shared/utils/parse-filters';
import { FilterTable } from '../../shared/dtos/filter-table';
import { ViewDTO } from '../../shared/dtos/view-dto';
import { PreviewMetadata } from '../../shared/interfaces/preview-metadata';
import { singleLangTopic } from '../../shared/utils/single-lang-topic';
import { RevisionDTO } from '../../shared/dtos/revision';
import { markdownToSafeHTML } from '../../shared/utils/markdown-to-html';
import { Filter, FilterV2 } from '../../shared/interfaces/filter';

export const DEFAULT_PAGE_SIZE = 100;

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

const parsePageOptions = (req: Request) => {
  const pageNumber = Number.parseInt(req.query.page_number as string, 10) || 1;
  const pageSize = Number.parseInt(req.query.page_size as string, 10) || DEFAULT_PAGE_SIZE;
  const sortBy = req.query.sort_by as unknown as SortByInterface;
  return { pageNumber, pageSize, sortBy };
};

export const viewPublishedDataset = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;
  const isUnpublished = revision?.unpublished_at || false;
  const isArchived = (dataset.archived_at && dataset.archived_at < new Date().toISOString()) || false;
  const selectedFilterOptions: Filter[] = [];
  const { pageNumber, pageSize, sortBy } = parsePageOptions(req);

  if (!revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  const [datasetMetadata, preview, filters, publishedRevisions]: [
    PreviewMetadata,
    ViewDTO,
    FilterTable[],
    RevisionDTO[]
  ] = await Promise.all([
    getDatasetMetadata(dataset, revision),
    req.conapi.getPublishedDatasetView(dataset.id, pageNumber, pageSize, sortBy, selectedFilterOptions),
    req.conapi.getPublishedDatasetFilters(dataset.id),
    req.conapi.getPublicationHistory(dataset.id)
  ]);

  const topics = dataset.published_revision?.topics?.map((topic) => singleLangTopic(topic, req.language)) || [];
  const pagination = pageInfo(preview.current_page, pageSize, preview.page_info?.total_records || 0);
  const publicationHistory = publishedRevisions.map((rev) => singleLangRevision(rev, req.language));

  for (const rev of publicationHistory) {
    if (rev?.metadata?.reason) {
      rev.metadata.reason = await markdownToSafeHTML(rev.metadata.reason);
    }
  }

  res.render('view', {
    ...preview,
    ...pagination,
    datasetMetadata,
    filters,
    topics,
    publicationHistory,
    selectedFilterOptions,
    shorthandUrl: req.buildUrl(`/shorthand`, req.language),
    isUnpublished,
    isArchived
  });
};

export const viewFilteredDataset = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  if (!revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  if (req.method === 'POST') {
    const selectedFilters: FilterV2[] = parseFiltersV2(req.body.filter);
    const filterId = await req.conapi.generateFilterId(dataset.id, selectedFilters);
    res.redirect(req.buildUrl(`/${dataset.id}/filtered/${filterId}`, req.language));
    return;
  }

  const filterId = req.params.filterId;
  const { pageNumber, pageSize, sortBy } = parsePageOptions(req);

  const [datasetMetadata, view, filters, publishedRevisions]: [PreviewMetadata, ViewDTO, FilterTable[], RevisionDTO[]] =
    await Promise.all([
      getDatasetMetadata(dataset, revision),
      req.conapi.getFilteredDatasetView(dataset.id, filterId, pageNumber, pageSize, sortBy),
      req.conapi.getPublishedDatasetFilters(dataset.id),
      req.conapi.getPublicationHistory(dataset.id)
    ]);

  const topics = dataset.published_revision?.topics?.map((topic) => singleLangTopic(topic, req.language)) || [];
  const pagination = pageInfo(view.current_page, pageSize, view.page_info?.total_records || 0);
  const publicationHistory = publishedRevisions.map((rev) => singleLangRevision(rev, req.language));

  for (const rev of publicationHistory) {
    if (rev?.metadata?.reason) {
      rev.metadata.reason = await markdownToSafeHTML(rev.metadata.reason);
    }
  }

  res.render('view', {
    ...view,
    ...pagination,
    datasetMetadata,
    filters,
    topics,
    publicationHistory,
    selectedFilterOptions: view.filters || [],
    shorthandUrl: req.buildUrl(`/shorthand`, req.language),
    isUnpublished: revision?.unpublished_at || false,
    isArchived: (dataset.archived_at && dataset.archived_at < new Date().toISOString()) || false
  });
};

export const downloadPublishedMetadata = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug('downloading published dataset metadata');
  const dataset = singleLangDataset(res.locals.dataset, req.language);
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

export const downloadPublishedDataset = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug('downloading published dataset');
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  try {
    if (!dataset.first_published_at || !revision) {
      throw new NotFoundException('no published revision found');
    }

    let attachmentName: string;
    if (revision.metadata?.title) {
      attachmentName = `${revision.metadata?.title}-${revision.revision_index > 0 ? `v${revision.revision_index}` : 'draft'}`;
    } else {
      attachmentName = `${dataset.id}-${revision.revision_index > 0 ? `v${revision.revision_index}` : 'draft'}`;
    }
    const view = req.query.view_choice as string;
    let selectedFilterOptions: string | undefined = undefined;
    if (req.query.view_type === 'filtered') {
      selectedFilterOptions = req.query.selected_filter_options?.toString();
    }
    logger.debug(`selectedFilterOptions = ${selectedFilterOptions}`);

    const format = req.query.format as FileFormat;
    const lang = req.query.download_language as Locale;
    const headers = getDownloadHeaders(format, attachmentName);
    const fileStream = await req.conapi.getCubeFileStream(dataset.id, format, lang, view, selectedFilterOptions);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (err) {
    next(err);
  }
};
