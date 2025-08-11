import { Readable } from 'node:stream';

import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import qs from 'qs';
import { stringify } from 'csv-stringify/sync';

import { DatasetListItemDTO } from '../../shared/dtos/dataset-list-item';
import { ResultsetWithCount } from '../../shared/interfaces/resultset-with-count';
import { generateSequenceForNumber, getPaginationProps } from '../../shared/utils/pagination';
import { singleLangDataset } from '../../shared/utils/single-lang-dataset';
import { getDatasetMetadata, metadataToCSV } from '../../shared/utils/dataset-metadata';
import { NotFoundException } from '../../shared/exceptions/not-found.exception';
import { FileFormat } from '../../shared/enums/file-format';
import { getDownloadHeaders } from '../../shared/utils/download-headers';
import { logger } from '../../shared/utils/logger';
import { Locale } from '../../shared/enums/locale';
import { appConfig } from '../../shared/config';
import { SortByInterface } from '../../shared/interfaces/sort-by';
import { TopicDTO } from '../../shared/dtos/topic';
import { parseFilters } from '../../shared/utils/parse-filters';

const config = appConfig();

export const DEFAULT_PAGE_SIZE = 100;

export const listTopics = async (req: Request, res: Response, next: NextFunction) => {
  const topicId = req.params.topicId ? req.params.topicId.match(/\d+/)?.[0] : undefined;

  try {
    const { selectedTopic, children, parents, datasets } = await req.conapi.getPublishedTopics(topicId);

    // add slug for friendlier URLs
    const childTopics =
      children?.map((topic: TopicDTO) => ({ ...topic, slug: slugify(topic.name, { lower: true }) })) || [];

    const parentTopics =
      parents?.map((topic: TopicDTO) => ({ ...topic, slug: slugify(topic.name, { lower: true }) })) || [];

    const datasetItems = datasets?.data;
    const consumerApiUrl = `${config.backend.url}/v1/docs`;

    res.render('topic-list', {
      selectedTopic,
      childTopics,
      parentTopics,
      datasets: datasetItems,
      consumerApiUrl
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
    const pagination = getPaginationProps(page, limit, count);

    res.render('list', { data, count, ...pagination, hide_pagination_hint: true });
  } catch (err) {
    next(err);
  }
};

export const viewPublishedDataset = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;
  const query = qs.parse(req.originalUrl.split('?')[1]);
  const pageNumber = Number.parseInt(query.page_number as string, 10) || 1;
  const pageSize = Number.parseInt(query.page_size as string, 10) || DEFAULT_PAGE_SIZE;
  let pagination: (string | number)[] = [];
  const sortBy = query.sort_by as unknown as SortByInterface;
  const selectedFilterOptions = parseFilters(query.filter as Record<string, string[]>);

  if (!dataset.live || !revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  const datasetMetadata = await getDatasetMetadata(dataset, revision);
  const preview = await req.conapi.getPublishedDatasetView(
    dataset.id,
    pageSize,
    pageNumber,
    sortBy,
    selectedFilterOptions
  );
  pagination = generateSequenceForNumber(preview.current_page, preview.total_pages);
  const filters = await req.conapi.getPublishedDatasetFilters(dataset.id);

  res.render('view', { ...preview, datasetMetadata, pagination, filters, selectedFilterOptions });
};

export const downloadPublishedMetadata = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug('downloading published dataset metadata');
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.published_revision;

  if (!dataset.live || !revision) {
    next(new NotFoundException('no published revision found'));
    return;
  }

  try {
    const metadata = await getDatasetMetadata(dataset, revision, false);
    const downloadMeta = metadataToCSV(metadata, req.language as Locale);

    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', `attachment; filename="${metadata.title}-meta.csv"`);
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
    if (!dataset.live || !revision) {
      throw new NotFoundException('no published revision found');
    }

    let attachmentName: string;
    if (revision.metadata?.title) {
      attachmentName = `${slugify(revision.metadata?.title, { lower: true })}-${revision.revision_index > 0 ? `v${revision.revision_index}` : 'draft'}`;
    } else {
      attachmentName = `${dataset.id}-${revision.revision_index > 0 ? `v${revision.revision_index}` : 'draft'}`;
    }
    let selectedFilterOptions: string | undefined = undefined;
    if (req.query.view_type === 'filtered') {
      selectedFilterOptions = req.query.selected_filter_options?.toString();
    }

    const format = req.query.format as FileFormat;
    const lang = req.query.download_language as Locale;
    const headers = getDownloadHeaders(format, attachmentName);

    if (!headers) {
      throw new NotFoundException('invalid file format');
    }

    const fileStream = await req.conapi.getCubeFileStream(dataset.id, format, lang, selectedFilterOptions);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (err) {
    next(err);
  }
};
