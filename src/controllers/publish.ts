import { Readable } from 'node:stream';

import { NextFunction, Request, Response } from 'express';
import { get, set, sortBy } from 'lodash';
import { FieldValidationError, matchedData } from 'express-validator';
import { nanoid } from 'nanoid';
import { v4 as uuid } from 'uuid';
import { isBefore, isValid } from 'date-fns';
import { parse } from 'csv-parse';

import {
  collectionValidator,
  dayValidator,
  designationValidator,
  frequencyUnitValidator,
  frequencyValueValidator,
  getErrors,
  groupIdValidator,
  hourValidator,
  isUpdatedValidator,
  linkIdValidator,
  linkLabelValidator,
  linkUrlValidator,
  minuteValidator,
  monthValidator,
  qualityValidator,
  roundingAppliedValidator,
  roundingDescriptionValidator,
  summaryValidator,
  titleValidator,
  topicIdValidator,
  yearValidator
} from '../validators';
import { ViewError } from '../dtos/view-error';
import { logger } from '../utils/logger';
import { ViewDTO, ViewErrDTO } from '../dtos/view-dto';
import { SourceType } from '../enums/source-type';
import { SourceAssignmentDTO } from '../dtos/source-assignment-dto';
import { UnknownException } from '../exceptions/unknown.exception';
import { TaskListState } from '../dtos/task-list-state';
import { NotFoundException } from '../exceptions/not-found.exception';
import { singleLangDataset, singleLangRevision } from '../utils/single-lang-dataset';
import { Designation } from '../enums/designation';
import { DurationUnit } from '../enums/duration-unit';
import { RelatedLinkDTO } from '../dtos/related-link';
import { RevisionProviderDTO } from '../dtos/revision-provider';
import { ProviderSourceDTO } from '../dtos/provider-source';
import { generateSequenceForNumber } from '../utils/pagination';
import { fileMimeTypeHandler } from '../utils/file-mimetype-handler';
import { TopicDTO } from '../dtos/topic';
import { NestedTopic, nestTopics } from '../utils/nested-topics';
import { DimensionType } from '../enums/dimension-type';
import { DimensionPatchDTO } from '../dtos/dimension-patch-dto';
import { ApiException } from '../exceptions/api.exception';
import { DimensionMetadataDTO } from '../dtos/dimension-metadata';
import { YearType } from '../enums/year-type';
import { addEditLinks } from '../utils/add-edit-links';
import { TranslationDTO } from '../dtos/translations';
import { getDatasetStatus, getPublishingStatus } from '../utils/dataset-status';
import { getDatasetPreview } from '../utils/dataset-preview';
import { FileFormat } from '../enums/file-format';
import { getDownloadHeaders } from '../utils/download-headers';
import { FactTableColumnDto } from '../dtos/fact-table-column-dto';
import { ProviderDTO } from '../dtos/provider';
import { Locale } from '../enums/locale';
import { getLatestRevision } from '../utils/revision';
import { DatasetInclude } from '../enums/dataset-include';
import { NumberType } from '../enums/number-type';
import { PreviewMetadata } from '../interfaces/preview-metadata';
import slugify from 'slugify';
import { DuckDBSupportFileFormats } from '../enums/support-fileformats';
import { TZDate } from '@date-fns/tz';
import { singleLangUserGroup } from '../utils/single-lang-user-group';
import { getApproverUserGroups, getEditorUserGroups, isEditor } from '../utils/user-permissions';
import { PublishingStatus } from '../enums/publishing-status';
import { NotAllowedException } from '../exceptions/not-allowed.exception';

export const start = (req: Request, res: Response) => {
  req.session.errors = undefined;
  req.session.save();

  // user must be in at least one group to start a new dataset
  if (!isEditor(req.user)) {
    req.session.errors = [{ field: '', message: { key: 'publish.start.errors.no_groups' } }];
    req.session.save();
    res.redirect(req.buildUrl('/', req.language));
    return;
  }

  // if the user is only in a single group, we can bypass group selection and go straight to title
  const editorGroups = getEditorUserGroups(req.user);
  const datasetGroup = editorGroups[0].group;
  const nextStep = editorGroups.length === 1 ? `title?group_id=${datasetGroup.id}` : 'group';

  res.render('publish/start', { nextStep });
};

export const provideDatasetGroup = async (req: Request, res: Response) => {
  const availableGroups = getEditorUserGroups(req.user).map((g) => singleLangUserGroup(g.group, req.language)) || [];
  const validGroupIds = availableGroups.map((group) => group.id) as string[];
  const values = req.body;
  let errors: ViewError[] = [];

  if (req.method === 'POST') {
    try {
      errors = (await getErrors(groupIdValidator(validGroupIds), req)).map((error: FieldValidationError) => {
        return {
          field: 'group_id',
          message: { key: `publish.group.form.group_id.error.${error.value ? 'invalid' : 'missing'}` }
        };
      });

      if (errors.length > 0) {
        res.status(400);
        throw new Error();
      }

      res.redirect(req.buildUrl(`/publish/title?group_id=${values.group_id}`, req.language));
      return;
    } catch (err) {
      if (err instanceof ApiException) {
        errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
      }
    }
  }

  res.render('publish/select-group', { availableGroups, values, errors });
};

export const dimensionColumnNameRegex = /^[a-zA-ZÀ-ž0-9()\-_ £¢€$%+]+$/;

export const provideTitle = async (req: Request, res: Response) => {
  let errors: ViewError[] = [];
  const group_id = req.query.group_id as string;
  const existingDataset = res.locals.dataset ? singleLangDataset(res.locals.dataset, req.language) : undefined;
  const revisit = Boolean(existingDataset); // dataset will not exist the first time through
  let title = existingDataset?.draft_revision?.metadata?.title;

  if (req.method === 'POST') {
    try {
      title = req.body.title;

      errors = (await getErrors(titleValidator(), req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `publish.title.form.title.error.${error.msg}` } };
      });

      if (errors.length > 0) {
        res.status(400);
        throw new Error();
      }

      if (existingDataset) {
        await req.pubapi.updateMetadata(existingDataset.id, { title, language: req.language });
        res.redirect(req.buildUrl(`/publish/${existingDataset.id}/tasklist`, req.language));
      } else {
        if (!group_id) {
          res.status(400);
          errors.push({ field: '', message: { key: 'publish.title.form.group_id.error.missing' } });
          throw new Error();
        }

        const dataset = await req.pubapi.createDataset(title!, group_id, req.language);
        res.redirect(req.buildUrl(`/publish/${dataset.id}/upload`, req.language));
      }
      return;
    } catch (err) {
      if (err instanceof ApiException) {
        errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
      }
    }
  }

  res.render('publish/title', { title, revisit, errors });
};

export const uploadDataTable = async (req: Request, res: Response) => {
  const dataset = res.locals.dataset;
  const revision = dataset.draft_revision;
  const revisit = dataset.dimensions?.length > 0;
  const supportedFormats = Object.values(DuckDBSupportFileFormats).map((format) => format.toLowerCase());
  const session = get(req.session, `dataset[${dataset.id}]`, { updateType: undefined });
  let errors: ViewError[] = [];

  if (req.method === 'POST') {
    logger.debug('User is uploading a fact table.');
    try {
      if (!req.file) {
        logger.error('No file is present in the request');
        errors.push({ field: 'csv', message: { key: 'publish.upload.errors.missing' } });
        throw new Error();
      }

      const fileName = req.file.originalname;
      req.file.mimetype = fileMimeTypeHandler(req.file.mimetype, req.file.originalname);
      const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
      logger.debug('Sending file to backend');

      if (session.updateType) {
        logger.info('Performing an update to the dataset');
        await req.pubapi.uploadCSVToUpdateDataset(dataset.id, revision.id, fileData, fileName, session.updateType);
      } else {
        await req.pubapi.uploadDataToDataset(dataset.id, fileData, fileName);
      }

      set(req.session, `dataset[${dataset.id}]`, undefined);
      req.session.save();
      res.redirect(req.buildUrl(`/publish/${dataset.id}/preview`, req.language));
      return;
    } catch (err) {
      logger.error(err, `There was a problem uploading the file`);
      if (err instanceof ApiException) {
        let body: ViewErrDTO = {
          status: err.status || 500,
          dataset_id: dataset.id,
          errors: [{ field: 'csv', message: { key: 'errors.fact_table_validation.unknown_error' } }]
        };
        try {
          body = JSON.parse(err.body?.toString() || '{}') as ViewErrDTO;
        } catch (parseError) {
          logger.error(parseError, 'Failed to parse error body as JSON');
        }
        res.status(body.status);
        errors = body.errors || [{ field: 'csv', message: { key: 'errors.fact_table_validation.unknown_error' } }];
      } else {
        res.status(500);
        errors = [{ field: 'csv', message: { key: 'errors.fact_table_validation.unknown_error' } }];
      }
    }
  }

  res.render('publish/upload', { revisit, supportedFormats: supportedFormats.join(', '), errors, uploadType: false });
};

export const factTablePreview = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = res.locals.dataset;
  const revision = dataset.draft_revision;
  const dataTable = revision?.data_table;
  const hasUnknownColumns = dataset.fact_table.some((col: FactTableColumnDto) => col.type === 'unknown');
  const isUpdate = Boolean(revision.previous_revision_id);
  const revisit = !isUpdate && !hasUnknownColumns;
  const session = get(req.session, `dataset[${dataset.id}]`, { updateType: undefined });

  let errors: ViewError[] | undefined;
  let previewData: ViewDTO | undefined;
  let ignoredCount = 0;
  let pagination: (string | number)[] = [];

  if (!dataset || !revision || !dataTable) {
    logger.error('Fact table not found');
    next(new UnknownException('errors.preview.import_missing'));
    return;
  }

  if (req.method === 'POST') {
    logger.debug(`User is confirming the fact table upload and source_type = ${session.updateType}`);

    try {
      if (revisit) {
        switch (req.body.actionChooser) {
          case 'replace-table':
            res.redirect(req.buildUrl(`/publish/${dataset.id}/upload`, req.language));
            return;
          case 'replace-sources':
            res.redirect(req.buildUrl(`/publish/${dataset.id}/sources`, req.language));
            return;
          default:
            res.status(400);
            errors = [{ field: 'actionChooserTable', message: { key: 'errors.preview.select_action' } }];
        }
      } else {
        if (req.body.confirm === 'true') {
          if (revision.revision_index === 0) {
            res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
          } else {
            await req.pubapi.confirmDataTable(dataset.id, revision.id);
            res.redirect(req.buildUrl(`/publish/${dataset.id}/sources`, req.language));
          }
        } else if (revision.revision_index === 0) {
          res.redirect(req.buildUrl(`/publish/${dataset.id}/update-type`, req.language));
        } else {
          res.redirect(req.buildUrl(`/publish/${dataset.id}/upload`, req.language));
        }
        return;
      }
    } catch (_err) {
      res.status(500);
      errors = [{ field: 'confirm', message: { key: 'errors.preview.confirm_error' } }];
    }
  }

  try {
    const pageNumber = Number.parseInt(req.query.page_number as string, 10) || 1;
    const pageSize = Number.parseInt(req.query.page_size as string, 10) || 10;
    previewData = await req.pubapi.getImportPreview(dataset.id, revision.id, pageNumber, pageSize);
    ignoredCount = previewData.headers.filter((header) => header.source_type === SourceType.Ignore).length;
    if (!previewData) {
      throw new Error('No preview data found.');
    }
    pagination = generateSequenceForNumber(previewData.current_page, previewData.total_pages);
  } catch (_err) {
    res.status(400);
    errors = [{ field: 'preview', message: { key: 'errors.preview.failed_to_get_preview' } }];
  }
  res.render('publish/preview', { ...previewData, ignoredCount, pagination, revisit, errors });
};

export const sources = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = res.locals.dataset;
  const revision = dataset.draft_revision;

  const factTable = dataset.fact_table.sort(
    (colA: FactTableColumnDto, colB: FactTableColumnDto) => colA.index - colB.index
  ) as FactTableColumnDto[];

  const revisit = factTable.filter((column: FactTableColumnDto) => column.type === SourceType.Unknown).length > 0;

  let error: ViewError | undefined;
  let errors: ViewError[] | undefined;

  if (!dataset || !revision || !factTable) {
    logger.error('Fact table not found');
    next(new UnknownException('errors.preview.import_missing'));
    return;
  }

  try {
    if (req.method === 'POST') {
      logger.debug('Validating the source definition');
      const counts = { unknown: 0, dataValues: 0, footnotes: 0, measure: 0 };
      const sourceAssignment: SourceAssignmentDTO[] = factTable.map((column: FactTableColumnDto) => {
        const sourceType = req.body[`column-${column.index}`];
        if (sourceType === SourceType.Unknown) counts.unknown++;
        if (sourceType === SourceType.DataValues) counts.dataValues++;
        if (sourceType === SourceType.NoteCodes) counts.footnotes++;
        if (sourceType === SourceType.Measure) counts.measure++;
        return {
          column_index: column.index,
          column_name: column.name,
          column_type: sourceType
        };
      });

      factTable.forEach((column: FactTableColumnDto) => {
        column.type =
          sourceAssignment.find((assignment: SourceAssignmentDTO) => assignment.column_index === column.index)
            ?.column_type || SourceType.Unknown;
      });

      if (counts.unknown > 0) {
        logger.error('User failed to identify all sources');
        error = { field: 'source', message: { key: 'errors.sources.unknowns_found' } };
      }

      if (counts.dataValues > 1) {
        logger.error('User tried to specify multiple data value sources');
        error = { field: 'source', message: { key: 'errors.sources.multiple_datavalues' } };
      }

      if (counts.footnotes > 1) {
        logger.error('User tried to specify multiple footnote sources');
        error = { field: 'source', message: { key: 'errors.sources.multiple_footnotes' } };
      }

      if (counts.measure > 1) {
        logger.error('User tried to specify multiple measure sources');
        error = { field: 'source', message: { key: 'errors.sources.multiple_measures' } };
      }

      if (error) {
        logger.error('There were errors validating the fact table');
        errors = [error];
        res.status(400);
      } else {
        logger.debug('Sending request to the backend.');
        await req.pubapi.assignSources(dataset.id, sourceAssignment);
        res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
        return;
      }
    }
  } catch (err) {
    const error = err as ApiException;
    const viewErr = JSON.parse((error.body as string) || '{}') as ViewErrDTO;
    if (viewErr.errors) {
      errors = viewErr.errors;
    } else {
      errors = [{ field: 'source', message: { key: 'errors.sources.assign_failed' } }];
    }
    logger.error(err, `There was a problem assigning source types`);
    res.status(error.status || 500);
    if (errors[0].message.key === 'errors.fact_table_validation.incomplete_fact') {
      res.render('publish/empty-fact', { ...viewErr, dimension: { factTableColumn: '' } });
      return;
    } else if (errors[0].message.key === 'errors.fact_table_validation.duplicate_fact') {
      res.render('publish/duplicate-fact', { ...viewErr, dimension: { factTableColumn: '' } });
      return;
    }
  }

  res.render('publish/sources', {
    factTable,
    sourceTypes: Object.values(SourceType),
    revisit,
    errors
  });
};

export const taskList = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.draft_revision!;
  const datasetStatus = getDatasetStatus(res.locals.dataset);
  const publishingStatus = getPublishingStatus(res.locals.dataset);

  try {
    if (req.method === 'POST') {
      // TODO: for MVP there is no approval process, so we are jumping straight to approve
      // once we have approval process, there will be an interstitial status while the dataset is waiting to
      // be approved by a suitable member of the team
      const scheduledDataset = await req.pubapi.approveForPublication(dataset.id, revision.id);

      if (scheduledDataset) {
        res.redirect(req.buildUrl(`/publish/${scheduledDataset.id}/overview`, req.language, { scheduled: 'true' }));
        return;
      }
    }

    const datasetTitle = revision.metadata?.title;
    const dimensions = dataset.dimensions;
    const taskList: TaskListState = await req.pubapi.getTaskList(dataset.id);
    res.render('publish/tasklist', {
      datasetTitle,
      taskList,
      revision,
      dimensions,
      datasetStatus,
      publishingStatus
    });
  } catch (err) {
    logger.error(err, `Failed to fetch the tasklist`);
    next(new NotFoundException());
  }
};

export const deleteDraft = async (req: Request, res: Response) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const datasetStatus = getDatasetStatus(res.locals.dataset);
  const publishingStatus = getPublishingStatus(res.locals.dataset);
  const draftRevision = dataset.draft_revision!;
  const draftType = publishingStatus === PublishingStatus.UpdateIncomplete ? 'update' : 'dataset';
  const datasetTitle = draftRevision.metadata?.title;
  const errors: ViewError[] = [];

  if (req.method === 'POST') {
    try {
      if (publishingStatus === PublishingStatus.Incomplete) {
        await req.pubapi.deleteDraftDataset(dataset.id);
        req.session.flash = [`publish.delete_draft.${draftType}.success`];
      } else if (publishingStatus === PublishingStatus.UpdateIncomplete) {
        await req.pubapi.deleteDraftRevision(dataset.id, draftRevision.id);
        req.session.flash = [`publish.delete_draft.${draftType}.success`];
      } else {
        throw new Error('Cannot delete a revision that is already published');
      }
      req.session.save();
      res.redirect(req.buildUrl(`/`, req.language));
      return;
    } catch (error) {
      logger.error(error, `Failed to delete draft`);
      errors.push({ field: 'unknown', message: { key: `publish.delete_draft.${draftType}.error` } });
      res.status(500);
    }
  }

  res.render('publish/delete-draft', { datasetTitle, datasetStatus, publishingStatus, errors });
};

export const cubePreview = async (req: Request, res: Response) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  let revision = dataset.draft_revision;
  let errors: ViewError[] | undefined;
  let previewData: ViewDTO | ViewErrDTO | undefined;
  let pagination: (string | number)[] = [];
  let previewMetadata: PreviewMetadata | undefined;
  let status = 200;

  if (!revision) {
    const revisionId = getLatestRevision(res.locals.dataset)?.id;
    const revWithMeta = await req.pubapi.getRevision(dataset.id, revisionId!);
    revision = singleLangRevision(revWithMeta, req.language)!;
  }

  const datasetStatus = getDatasetStatus(res.locals.dataset);
  const publishingStatus = getPublishingStatus(res.locals.dataset);
  const datasetTitle = revision.metadata?.title;

  try {
    const pageNumber = Number.parseInt(req.query.page_number as string, 10) || 1;
    const pageSize = Number.parseInt(req.query.page_size as string, 10) || 10;
    previewData = await req.pubapi.getRevisionPreview(dataset.id, revision.id, pageNumber, pageSize);
    pagination = generateSequenceForNumber(previewData.current_page, previewData.total_pages);
  } catch (error) {
    logger.error(error, `Failed to get preview data for revision ${revision.id}`);
    status = 500;
  }

  try {
    previewMetadata = await getDatasetPreview(dataset, revision);
  } catch (error) {
    logger.error(error, `Failed to get preview metadata for revision ${revision.id}`);
    status = 500;
  }
  res.status(status);
  if (previewMetadata) {
    errors = [{ field: 'preview', message: { key: 'errors.preview.failed_to_get_preview' } }];
    if (!previewData) {
      previewData = {
        status: 500,
        errors,
        dataset_id: dataset.id
      };
    }
    res.render('publish/cube-preview', {
      ...previewData,
      preview: previewMetadata,
      dataset,
      pagination,
      errors,
      datasetStatus,
      publishingStatus,
      datasetTitle
    });
    return;
  }

  res.render('publish/preview-failure', { datasetStatus, publishingStatus, datasetTitle });
};

export const downloadDataset = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  let revision = dataset.draft_revision;

  try {
    if (!revision) {
      const revisionId = getLatestRevision(res.locals.dataset)?.id;
      const revWithMeta = await req.pubapi.getRevision(dataset.id, revisionId!);
      revision = singleLangRevision(revWithMeta, req.language)!;
    }

    let attachmentName: string;
    if (revision.metadata?.title) {
      attachmentName = `${slugify(revision.metadata?.title, { lower: true })}-${revision.revision_index > 0 ? `v${revision.revision_index}` : 'draft'}`;
    } else {
      attachmentName = `${dataset.id}-${revision.revision_index > 0 ? `v${revision.revision_index}` : 'draft'}`;
    }

    const format = req.query.format as FileFormat;
    const headers = getDownloadHeaders(format, attachmentName);

    if (!headers) {
      throw new NotFoundException('errors.preview.invalid_download_format');
    }
    logger.debug(`Getting file from backend...`);
    const fileStream = await req.pubapi.getCubeFileStream(dataset.id, revision.id, format);
    res.writeHead(200, headers);
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
  } catch (err) {
    next(err);
  }
};

export const redirectToTasklist = (req: Request, res: Response) => {
  res.redirect(req.buildUrl(`/publish/${req.params.datasetId}/tasklist`, req.language));
};

export const measurePreview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const measure = dataset.measure;
    if (!measure) {
      logger.error('Measure not defined for this dataset');
      next(new UnknownException('errors.preview.measure_not_found'));
      return;
    }

    const dataPreview = await req.pubapi.getMeasurePreview(res.locals.dataset.id);
    const supportedFormats = Object.values(DuckDBSupportFileFormats).map((format) => format.toLowerCase());
    if (req.method === 'POST') {
      logger.debug('User is uploading a measure lookup table..');
      if (!req.file) {
        logger.error('No file attached to request');
        const errors: ViewError[] = [
          {
            field: 'csv',
            message: {
              key: 'errors.upload.no_csv'
            }
          }
        ];
        res.status(400);
        res.render('publish/measure-preview', { ...dataPreview, measure, errors });
        return;
      }

      try {
        const fileName = req.file.originalname;
        req.file.mimetype = fileMimeTypeHandler(req.file.mimetype, req.file.originalname);
        const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
        logger.debug('Sending file to backend.');
        await req.pubapi.uploadMeasureLookup(dataset.id, fileData, fileName);
        res.redirect(req.buildUrl(`/publish/${dataset.id}/measure/review`, req.language));
        return;
      } catch (err) {
        const error = err as ApiException;
        const viewErr = JSON.parse((error.body as string) || '{}') as ViewErrDTO;
        logger.debug(`Error is: ${JSON.stringify(viewErr, null, 2)}`);
        if (error.status === 400) {
          res.status(400);
          if (!(viewErr.extension as { mismatch: boolean }).mismatch) {
            res.render('publish/measure-preview', {
              ...dataPreview,
              supportedFormats: supportedFormats.join(','),
              measure,
              errors: viewErr.errors
            });
            return;
          }
          logger.error('Measure lookup table did not match data in the fact table.', err);
          res.status(400);
          res.render('publish/measure-match-failure', {
            ...viewErr,
            measure
          });
          return;
        }
        logger.error('Something went wrong other than not matching');
        logger.debug(`Full error JSON: ${JSON.stringify(error, null, 2)}`);
        res.render('publish/measure-preview', {
          ...dataPreview,
          supportedFormats: supportedFormats.join(','),
          measure,
          errors: viewErr.errors
        });
        return;
      }
    }

    let langCol = -1;
    if (dataPreview.headers.find((header) => header.name.toLowerCase().indexOf('lang') > -1)) {
      langCol = dataPreview.headers.findIndex((header) => header.name.toLowerCase().indexOf('lang') > -1);
    }

    const revisit = Boolean(measure.measure_table && measure.measure_table.length > 0);
    let page = 'publish/measure-preview';
    if (req.path.indexOf('change') > -1) page = 'publish/measure-preview';
    else if (revisit) page = 'publish/measure-revisit';

    if (req.session.errors) {
      const errors = req.session.errors;
      req.session.errors = undefined;
      req.session.save();
      res.status(500);
      res.render(page, {
        ...dataPreview,
        langCol,
        measure,
        errors
      });
    } else {
      res.render(page, { ...dataPreview, supportedFormats: supportedFormats.join(','), langCol, measure });
    }
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const measureReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const measure = dataset.measure;
    if (!measure) {
      logger.error('Failed to find measure in dataset');
      next(new NotFoundException());
      return;
    }
    let errors: ViewErrDTO | undefined;

    if (req.method === 'POST') {
      logger.debug(`User has reviewed measure lookup table.`);
      switch (req.body.confirm) {
        case 'continue':
          res.redirect(req.buildUrl(`/publish/${dataset.id}/measure/name`, req.language));
          break;
        case 'cancel':
          try {
            await req.pubapi.resetMeasure(dataset.id);
            res.redirect(req.buildUrl(`/publish/${dataset.id}/measure`, req.language));
          } catch (err) {
            const error = err as ApiException;
            logger.error(`Something went wrong trying to reset the dimension with the following error: ${err}`);
            errors = {
              status: error.status || 500,
              errors: [
                {
                  field: '',
                  message: {
                    key: 'errors.dimension_reset'
                  }
                }
              ],
              dataset_id: req.params.datasetId
            } as ViewErrDTO;
          }
          break;
      }
      return;
    }

    const dataPreview = await req.pubapi.getMeasurePreview(res.locals.dataset.id);
    if (errors) {
      res.status(errors.status || 500);
    }
    res.render('publish/measure-review', { ...dataPreview, measure, review: true, errors });
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const uploadLookupTable = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = res.locals.dataset;
  const dimension = singleLangDataset(res.locals.dataset, req.language).dimensions?.find(
    (dim) => dim.id === req.params.dimensionId
  );
  if (!dimension) {
    logger.error('Failed to find dimension in dataset');
    next(new NotFoundException());
    return;
  }
  let errors: ViewError[] | undefined;
  const revisit = dataset.dimensions?.length > 0;
  let dataPreview: ViewDTO | ViewErrDTO;
  try {
    dataPreview = await req.pubapi.getDimensionPreview(res.locals.dataset.id, dimension.id);
  } catch (err) {
    logger.debug(err, `Failed to get lookup dimension preview`);
    const error = err as ApiException;
    dataPreview = {
      status: error.status || 500,
      errors: [
        {
          field: '',
          message: {
            key: 'errors.dimension_preview'
          }
        }
      ],
      dataset_id: dataset.id
    };
  }
  const supportedFormats = Object.values(DuckDBSupportFileFormats).map((format) => format.toLowerCase());
  if (req.method === 'POST') {
    logger.debug('User submitted a look up table');
    try {
      if (!req.file) {
        res.status(400);
        res.render('publish/upload-lookup', {
          ...dataPreview,
          supportedFormats: supportedFormats.join(','),
          revisit,
          errors: [
            {
              field: 'csv',
              message: {
                key: 'errors.upload.no_csv'
              }
            }
          ],
          uploadType: 'lookup',
          dimension,
          changeLookup: Boolean(dimension.type === 'lookup_table')
        });
        return;
      }
      const fileName = req.file.originalname;
      req.file.mimetype = fileMimeTypeHandler(req.file.mimetype, req.file.originalname);
      const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
      try {
        logger.debug('Sending lookup table to backend');
        await req.pubapi.uploadLookupTable(dataset.id, dimension.id, fileData, fileName);
        res.redirect(req.buildUrl(`/publish/${dataset.id}/lookup/${dimension.id}/review`, req.language));
      } catch (err) {
        const error = err as ApiException;
        logger.debug(`Error is: ${JSON.stringify(error, null, 2)}`);
        if (error.status === 400) {
          res.status(400);
          logger.error('Lookup table did not match data in the fact table.', err);
          const failurePreview = JSON.parse(error.body as string) as ViewErrDTO;
          res.render('publish/dimension-match-failure', {
            ...failurePreview,
            patchRequest: { dimension_type: DimensionType.LookupTable },
            dimension
          });
          return;
        }
        logger.error('Something went wrong other than not matching');
        logger.error(`Full error JSON: ${JSON.stringify(error, null, 2)}`);
        res.status(500);
        res.render('publish/upload-lookup', {
          ...dataPreview,
          supportedFormats: supportedFormats.join(','),
          revisit,
          errors: [
            {
              field: 'unknown',
              message: {
                key: 'errors.csv.unknown'
              }
            }
          ],
          uploadType: 'lookup',
          dimension,
          changeLookup: Boolean(dimension.type === 'lookup_table')
        });
        return;
      }

      return;
    } catch (err) {
      logger.error(err, 'Seems some other error happened and we ended up here.');
      res.status(500);
      errors = [{ field: 'csv', message: { key: 'errors.upload.no_csv_data' } }];
    }
  }

  res.render('publish/upload-lookup', {
    ...dataPreview,
    revisit,
    errors,
    supportedFormats: supportedFormats.join(','),
    uploadType: 'lookup',
    dimension,
    changeLookup: Boolean(dimension.type === 'lookup_table')
  });
};

export const lookupReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
    if (!dimension) {
      logger.error('Failed to find dimension in dataset');
      next(new NotFoundException());
      return;
    }
    let errors: ViewErrDTO | undefined;
    const revisit = Boolean(dimension.factTableColumn !== dimension.metadata?.name);

    if (req.method === 'POST') {
      switch (req.body.confirm) {
        case 'true':
          if (revisit) res.redirect(req.buildUrl(`/publish/${dataset.id}/dimension/${dimension.id}`, req.language));
          else res.redirect(req.buildUrl(`/publish/${dataset.id}/dimension/${dimension.id}/name`, req.language));
          break;
        case 'goback':
          try {
            await req.pubapi.resetDimension(dataset.id, dimension.id);
            if (dimension.type === DimensionType.LookupTable) {
              res.redirect(req.buildUrl(`/publish/${dataset.id}/lookup/${dimension.id}/`, req.language));
            } else {
              res.redirect(req.buildUrl(`/publish/${dataset.id}/dimension/${dimension.id}`, req.language));
            }
          } catch (err) {
            const error = err as ApiException;
            logger.error(`Something went wrong trying to reset the dimension with the following error: ${err}`);
            errors = {
              status: error.status || 500,
              errors: [
                {
                  field: '',
                  message: {
                    key: 'errors.dimension_reset'
                  }
                }
              ],
              dataset_id: req.params.datasetId
            } as ViewErrDTO;
          }
          break;
      }
      return;
    }

    const dataPreview = await req.pubapi.getDimensionPreview(res.locals.dataset.id, dimension.id);
    if (errors) {
      res.status(errors.status || 500);
      res.render('publish/lookup-table-preview', { ...dataPreview, review: true, dimension, errors });
    } else {
      res.render('publish/lookup-table-preview', { ...dataPreview, review: true, dimension });
    }
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const setupNumberDimension = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const dimension = singleLangDataset(res.locals.dataset, req.language).dimensions?.find(
      (dim) => dim.id === req.params.dimensionId
    );
    if (!dimension) {
      logger.error('Failed to find dimension in dataset');
      next(new NotFoundException());
      return;
    }

    const dataPreview = await req.pubapi.getDimensionPreview(res.locals.dataset.id, dimension.id);

    if (req.method === 'POST') {
      if (!req.body.numberType) {
        logger.error('No number type selected');
        res.status(400);
        res.render('publish/number-chooser', {
          ...dataPreview,
          errors: [
            {
              field: 'numberTypeInteger',
              message: {
                key: 'errors.dimension.number_type_required'
              }
            }
          ],
          dimension
        });
        return;
      }
      const dimensionPatch: DimensionPatchDTO = {
        dimension_id: dimension.id,
        dimension_type: DimensionType.Numeric,
        number_format: req.body.numberType as NumberType,
        decimal_places: (req.body.numberType as NumberType) === NumberType.Decimal ? req.body.decimalPlaces : 0
      };
      try {
        await req.pubapi.patchDimension(res.locals.dataset.id, dimension.id, dimensionPatch);
        res.redirect(req.buildUrl(`/publish/${dataset.id}/lookup/${dimension.id}/review`, req.language));
      } catch (error) {
        const errorObj = error as ApiException;
        logger.error(`Error is: ${JSON.stringify(errorObj, null, 2)}`);
        if (errorObj.status === 400) {
          logger.error(error, 'Failed to setup number dimension.');
          const failurePreview = JSON.parse(errorObj.body as string) as ViewErrDTO;
          res.status(400);
          res.render('publish/number-match-failure', {
            ...failurePreview,
            dimension
          });
        } else {
          res.status(500);
          res.render('publish/number-chooser', {
            ...dataPreview,
            errors: [
              {
                field: 'unknown',
                message: {
                  key: 'errors.csv.unknown'
                }
              }
            ]
          });
        }
      }
      return;
    }

    const errors = req.session.errors;
    if (errors) {
      req.session.errors = undefined;
      req.session.save();
      res.status(500);
      res.render('publish/number-chooser', { ...dataPreview, dimension, errors });
      return;
    }

    if (dimension && dimension.extractor && req.path.indexOf('change') === -1) {
      res.render('publish/number-chooser', { ...dataPreview, dimension });
    } else {
      res.render('publish/number-chooser', {
        ...dataPreview,
        dimension,
        showCancelButton: Boolean(req.path.indexOf('change') > -1)
      });
    }
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const fetchDimensionPreview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const dimension = singleLangDataset(res.locals.dataset, req.language).dimensions?.find(
      (dim) => dim.id === req.params.dimensionId
    );
    if (!dimension) {
      logger.error('Failed to find dimension in dataset');
      next(new NotFoundException());
      return;
    }

    const dataPreview = await req.pubapi.getDimensionPreview(res.locals.dataset.id, dimension.id);

    if (req.method === 'POST') {
      let dimensionPatch: DimensionPatchDTO;
      switch (req.body.dimensionType) {
        case 'lookup':
          res.redirect(req.buildUrl(`/publish/${dataset.id}/lookup/${dimension.id}`, req.language));
          return;
        case 'Date':
          if (dimension.extractor && req.path.indexOf('change') >= 0) {
            res.redirect(req.buildUrl(`/publish/${dataset.id}/dates/${dimension.id}/change-format`, req.language));
          } else {
            res.redirect(req.buildUrl(`/publish/${dataset.id}/dates/${dimension.id}`, req.language));
          }
          return;
        case 'Number':
          res.redirect(req.buildUrl(`/publish/${dataset.id}/numbers/${dimension.id}`, req.language));
          return;
        case 'Text':
          dimensionPatch = {
            dimension_id: dimension.id,
            dimension_type: DimensionType.Text
          };
          await req.pubapi.patchDimension(res.locals.dataset.id, dimension.id, dimensionPatch);
          res.redirect(req.buildUrl(`/publish/${dataset.id}/lookup/${dimension.id}/review`, req.language));
          return;
        case 'Geog':
        case 'Age':
        case 'Eth':
        case 'Gen':
        case 'Rlgn':
          dimensionPatch = {
            dimension_id: dimension.id,
            dimension_type: DimensionType.ReferenceData,
            reference_type: req.body.dimensionType
          };
          try {
            await req.pubapi.patchDimension(res.locals.dataset.id, dimension.id, dimensionPatch);
            res.redirect(req.buildUrl(`/publish/${dataset.id}/lookup/${dimension.id}/review`, req.language));
          } catch (err) {
            const error = err as ApiException;
            logger.debug(`Error is: ${JSON.stringify(error, null, 2)}`);
            if (error.status === 400) {
              res.status(400);
              logger.error('Reference data did not match data in the fact table.', err);
              const failurePreview = JSON.parse(error.body as string) as ViewErrDTO;
              res.render('publish/dimension-match-failure', {
                ...failurePreview,
                patchRequest: dimensionPatch,
                dimension
              });
              return;
            }
            logger.error('Something went wrong other than not matching');
            logger.error(`Full error JSON: ${JSON.stringify(error, null, 2)}`);
            req.session.errors = [
              {
                field: 'unknown',
                message: {
                  key: 'errors.csv.unknown'
                }
              }
            ];
            res.redirect(req.buildUrl(`/publish/${dataset.id}/dimension/${dimension.id}/`, req.language));
            return;
          }
          break;
        default:
          res.status(400);
          res.render('publish/dimension-chooser', {
            ...dataPreview,
            dimension,
            errors: [
              {
                field: 'dimensionTypeGeography',
                message: { key: 'errors.dimension.dimension_type_required' }
              }
            ],
            showCancelButton: Boolean(req.path.indexOf('change') > -1)
          });
      }
      return;
    }

    const errors = req.session.errors;
    if (errors) {
      req.session.errors = undefined;
      req.session.save();
      res.status(500);
      res.render('publish/dimension-chooser', { ...dataPreview, dimension, errors });
      return;
    }

    if (dimension && dimension.extractor && req.path.indexOf('change') === -1) {
      res.render('publish/dimension-revisit', { ...dataPreview, dimension });
    } else {
      res.render('publish/dimension-chooser', {
        ...dataPreview,
        dimension,
        showCancelButton: Boolean(req.path.indexOf('change') > -1)
      });
    }
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

// I know this is the same as the `fetchDimensionPreview` however longer term
// I'd like to introduce a sniffer to sniff the time time dimension which could
// reduce the questions we need to ask date identification.
export const fetchTimeDimensionPreview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dimension = singleLangDataset(res.locals.dataset, req.language).dimensions?.find(
      (dim) => dim.id === req.params.dimensionId
    );
    if (!dimension) {
      logger.error('dimensionId is a required parameter');
      next(new NotFoundException());
      return;
    }

    const dataPreview = await req.pubapi.getDimensionPreview(res.locals.dataset.id, dimension.id);
    if (req.method === 'POST') {
      switch (req.body.dimensionType) {
        case 'time_period':
          res.redirect(req.buildUrl(`/publish/${req.params.datasetId}/dates/${dimension.id}/period`, req.language));
          break;
        case 'time_point':
          res.redirect(
            req.buildUrl(`/publish/${req.params.datasetId}/dates/${dimension.id}/point-in-time`, req.language)
          );
          break;
        default:
          logger.error('User failed to select an option for time dimension type');
          res.status(400);
          res.render('publish/date-chooser', {
            ...dataPreview,
            dimension,
            errors: [
              {
                field: 'dimensionTypePeriod',
                message: {
                  key: 'errors.dimension.dimension_period_type_required'
                }
              }
            ]
          });
      }
      return;
    }
    logger.debug(JSON.stringify(dimension, null, 2));
    if (dimension && dimension.extractor && req.path.indexOf('change') === -1) {
      res.render('publish/dimension-revisit', { ...dataPreview, dimension });
    } else {
      res.render('publish/date-chooser', { ...dataPreview, dimension });
    }
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const yearTypeChooser = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
  const session = get(req.session, `dataset[${dataset.id}]`, { dimensionPatch: undefined });

  if (!dimension) {
    logger.error('Failed to find dimension in dataset');
    next(new NotFoundException());
    return;
  }

  try {
    if (req.method === 'POST') {
      if (!req.body.yearType) {
        logger.error('User failed to select an option for year type');
        res.status(400);
        res.render('publish/year-type', {
          dimension,
          errors: [
            {
              field: 'yearTypeCalendar',
              message: {
                key: 'errors.dimension.year_type_required'
              }
            }
          ]
        });
        return;
      }
      if (req.body.yearType === 'calendar') {
        session.dimensionPatch = {
          dimension_id: req.params.dimensionId,
          dimension_type: DimensionType.DatePeriod,
          date_type: req.body.yearType,
          year_format: 'YYYY'
        };
        set(req.session, `dataset[${dataset.id}]`, session);
        req.session.save();
        res.redirect(
          req.buildUrl(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/period/type`, req.language)
        );
        return;
      } else {
        session.dimensionPatch = {
          dimension_id: req.params.dimensionId,
          dimension_type: DimensionType.Date,
          date_type: req.body.yearType
        };
        set(req.session, `dataset[${dataset.id}]`, session);
        req.session.save();
        res.redirect(
          req.buildUrl(
            `/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/period/year-format`,
            req.language
          )
        );
        return;
      }
    }

    res.render('publish/year-type', { dimension });
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const yearFormat = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
  const session = get(req.session, `dataset[${dataset.id}]`, { dimensionPatch: undefined });

  if (!dimension) {
    logger.error('Failed to find dimension in dataset');
    next(new NotFoundException());
    return;
  }

  try {
    if (req.method === 'POST') {
      if (!session.dimensionPatch || session.dimensionPatch.dimension_id !== dimension.id) {
        logger.error('Failed to find patch information in the session.');
        throw new Error('Year type not set in previous step');
      }
      if (!req.body.yearType) {
        logger.error('User failed to select an option for year format');
        res.status(400);
        res.render('publish/year-format', {
          dimension,
          errors: [
            {
              field: 'year-format-1',
              message: {
                key: 'errors.dimension.year_format_required'
              }
            }
          ]
        });
        return;
      }
      session.dimensionPatch.year_format = req.body.yearType;
      set(req.session, `dataset[${dataset.id}]`, session);
      req.session.save();
      res.redirect(
        req.buildUrl(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/period/type`, req.language)
      );
      return;
    }

    res.render('publish/year-format', { dimension });
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const periodType = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
  const session = get(req.session, `dataset[${dataset.id}]`, { dimensionPatch: undefined });

  if (!dimension) {
    logger.error('Failed to find dimension in dataset');
    next(new NotFoundException());
    return;
  }

  try {
    const patchRequest = session.dimensionPatch;
    if (!patchRequest) {
      logger.error('Failed to find patch information in the session');
      req.buildUrl(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/period/`, req.language);
      return;
    }

    if (req.method === 'POST') {
      switch (req.body.periodType) {
        case 'years':
          try {
            await req.pubapi.patchDimension(dataset.id, dimension.id, patchRequest);
            logger.debug('Matching complete for year... Redirecting to review.');
            res.redirect(
              req.buildUrl(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/review`, req.language)
            );
            return;
          } catch (err) {
            const error = err as ApiException;
            logger.debug(`Error is: ${JSON.stringify(error, null, 2)}`);
            if (error.status === 400) {
              res.status(400);
              logger.error('Date dimension had inconsistent formats than supplied by the user.', err);
              const failurePreview = JSON.parse(error.body as string) as ViewErrDTO;
              res.render('publish/period-match-failure', { ...failurePreview, patchRequest, dimension });
              return;
            }
            logger.error('Something went wrong other than not matching');
            res.status(500);
            res.render('publish/period-type', {
              dimension,
              errors: [
                {
                  field: '',
                  message: {
                    key: 'errors.dimension_validation.unknown_error'
                  }
                }
              ]
            });
            return;
          }
        case 'quarters':
          res.redirect(
            req.buildUrl(
              `/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/period/quarters`,
              req.language
            )
          );
          return;
        case 'months':
          res.redirect(
            req.buildUrl(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/period/months`, req.language)
          );
          return;
        default:
          logger.error('User failed to select an option for the shortest period of time');
          res.status(400);
          res.render('publish/period-type', {
            dimension,
            errors: [
              {
                field: 'periodTypeChooserYears',
                message: {
                  key: 'errors.dimension.shortest_period_required'
                }
              }
            ]
          });
          return;
      }
    }
    res.render('publish/period-type', { dimension });
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const quarterChooser = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
  const session = get(req.session, `dataset[${dataset.id}]`, { dimensionPatch: undefined });

  if (!dimension) {
    logger.error('Failed to find dimension in dataset');
    next(new NotFoundException());
    return;
  }

  try {
    const quarterTotals = session.dimensionPatch?.month_format ? true : false;

    if (req.method === 'POST') {
      const patchRequest = session.dimensionPatch;
      if (!patchRequest) {
        res.redirect(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}`);
        return;
      }

      const errors: ViewError[] = [];
      if (!req.body.quarterType) {
        logger.error('User failed to select an option for quarter type');
        errors.push({
          field: 'quarter-format-2',
          message: {
            key: 'errors.dimension.quarter_type_required'
          }
        });
      }

      if (!req.body.fifthQuater) {
        logger.error('User failed to select how quarterly totals is represented');
        errors.push({
          field: 'fifth-quater-yes',
          message: {
            key: 'errors.dimension.quarter_total_type_required'
          }
        });
      }

      if (errors.length > 0) {
        res.status(400);
        res.render('publish/quarter-format', {
          dimension,
          errors,
          quarterType: req.body.quarterType,
          fifthQuater: req.body.fifthQuater
        });
        return;
      }

      patchRequest.quarter_format = req.body.quarterType;
      if (req.body.fifthQuater === 'yes') {
        patchRequest.fifth_quarter = true;
      }
      try {
        await req.pubapi.patchDimension(dataset.id, dimension.id, patchRequest);

        session.dimensionPatch = undefined;
        set(req.session, `dataset[${dataset.id}]`, session);
        req.session.save();
        res.redirect(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/review`);
        return;
      } catch (err) {
        session.dimensionPatch = undefined;
        set(req.session, `dataset[${dataset.id}]`, session);
        req.session.save();
        const error = err as ApiException;
        logger.debug(`Error is: ${JSON.stringify(error, null, 2)}`);
        if (error.status === 400) {
          res.status(400);
          logger.error('Date dimension had inconsistent formats than supplied by the user.', err);
          const failurePreview = JSON.parse(error.body as string) as ViewErrDTO;
          res.render('publish/period-match-failure', { ...failurePreview, patchRequest, dimension });
          return;
        }
        logger.error('Something went wrong other than not matching');
        logger.error(`Full error JSON: ${JSON.stringify(error, null, 2)}`);
        res.redirect(
          req.buildUrl(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/period/`, req.language)
        );
        return;
      }
    }
    logger.debug(`Session dimensionPatch = ${JSON.stringify(session.dimensionPatch, null, 2)}`);
    res.render('publish/quarter-format', { quarterTotals, dimension });
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const monthChooser = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
  const session = get(req.session, `dataset[${dataset.id}]`, { dimensionPatch: undefined });

  if (!dimension) {
    logger.error('Failed to find dimension in dataset');
    next(new NotFoundException());
    return;
  }

  try {
    if (req.method === 'POST') {
      const patchRequest = session.dimensionPatch;
      if (!patchRequest) {
        logger.error('Failed to find dimension in dataset in session');
        res.redirect(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}`);
        return;
      }
      if (!req.body.monthFormat) {
        logger.error('User failed to select an option for month type');
        res.status(400);
        res.render('publish/month-format', {
          dimension,
          errors: [
            {
              field: 'month-format-1',
              message: {
                key: 'errors.dimension.month_type_required'
              }
            }
          ]
        });
        return;
      }
      patchRequest.month_format = req.body.monthFormat;
      session.dimensionPatch = patchRequest;
      set(req.session, `dataset[${dataset.id}]`, session);
      logger.debug(`Saving Dimension Patch to session with the following: ${JSON.stringify(patchRequest, null, 2)}`);
      req.session.save();
      try {
        await req.pubapi.patchDimension(dataset.id, dimension.id, patchRequest);

        session.dimensionPatch = undefined;
        set(req.session, `dataset[${dataset.id}]`, session);
        req.session.save();
        res.redirect(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/review`);
        return;
      } catch (_err) {
        logger.debug(`There were rows which didn't match.  Lets ask the user about quarterly totals.`);
        res.redirect(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/period/quarters`);
        return;
      }
    }
    const dataPreview = await req.pubapi.getDimensionPreview(res.locals.dataset.id, dimension.id);
    res.render('publish/month-format', { ...dataPreview, dimension });
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const periodReview = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);

  if (!dimension) {
    logger.error('Failed to find dimension in dataset');
    next(new NotFoundException());
    return;
  }
  let errors: ViewErrDTO | undefined;

  try {
    if (req.method === 'POST') {
      switch (req.body.confirm) {
        case 'true':
          res.redirect(
            req.buildUrl(`/publish/${req.params.datasetId}/dimension/${req.params.dimensionId}/name`, req.language)
          );
          break;
        case 'goback':
          try {
            await req.pubapi.resetDimension(dataset.id, dimension.id);
            res.redirect(
              req.buildUrl(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/`, req.language)
            );
          } catch (err) {
            const error = err as ApiException;
            logger.error(`Something went wrong trying to reset the dimension with the following error: ${err}`);
            errors = {
              status: error.status || 500,
              errors: [
                {
                  field: '',
                  message: {
                    key: 'errors.dimension_reset'
                  }
                }
              ],
              dataset_id: req.params.datasetId
            } as ViewErrDTO;
          }
          break;
      }
      return;
    }

    const dataPreview = await req.pubapi.getDimensionPreview(res.locals.dataset.id, dimension.id);
    if (errors) {
      res.status(errors.status || 500);
      res.render('publish/date-chooser', { ...dataPreview, review: true, dimension, errors });
    } else {
      res.render('publish/date-chooser', { ...dataPreview, review: true, dimension });
    }
  } catch (err) {
    logger.error('Failed to get dimension preview', err);
    next(new NotFoundException());
  }
};

export const measureName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const measure = dataset.measure;
    if (!measure) {
      logger.error('Failed to find measure in dataset');
      next(new NotFoundException());
      return;
    }
    let errors: ViewErrDTO | undefined;
    const revisit = Boolean(req.path.indexOf('change') > -1);
    const measureName = revisit ? measure.metadata?.name : '';
    if (req.method === 'POST') {
      // TODO Replace validation if statements with an Express Validator
      //  See https://github.com/Marvell-Consulting/statswales-frontend/pull/138
      const updatedName = req.body.name;
      if (!updatedName) {
        logger.error('User failed to submit a name');
        res.status(400);
        errors = {
          status: 400,
          errors: [
            {
              field: 'name',
              message: {
                key: 'errors.no_name'
              }
            }
          ],
          dataset_id: req.params.datasetId
        };
        res.status(400);
        res.render('publish/dimension-name', {
          ...{ updatedName, id: measure.id, dimensionType: DimensionType.Measure },
          errors,
          revisit
        });
        return;
      }
      if (updatedName.length > 256) {
        logger.error(`Measure name is too long... length: ${req.body.name.length}`);
        errors = {
          status: 400,
          errors: [
            {
              field: 'name',
              message: {
                key: 'errors.dimension.name_too_long'
              }
            }
          ],
          dataset_id: req.params.datasetId
        };
        res.status(400);
        res.render('publish/dimension-name', {
          ...{ updatedName, id: measure.id, dimensionType: DimensionType.Measure },
          errors,
          revisit
        });
        return;
      } else if (updatedName.length < 1) {
        logger.error(`Measure name is too short.`);
        errors = {
          status: 400,
          errors: [
            {
              field: 'name',
              message: {
                key: 'errors.dimension.name_too_short'
              }
            }
          ],
          dataset_id: req.params.datasetId
        };
        res.status(400);
        res.render('publish/dimension-name', {
          ...{ updatedName, id: measure.id, dimensionType: DimensionType.Measure },
          errors,
          revisit
        });
        return;
      } else if (!dimensionColumnNameRegex.test(updatedName)) {
        logger.error(`Measure name contains characters which aren't allowed.`);
        errors = {
          status: 400,
          errors: [
            {
              field: 'name',
              message: {
                key: 'errors.dimension.illegal_characters'
              }
            }
          ],
          dataset_id: req.params.datasetId
        };
        res.status(400);
        res.render('publish/dimension-name', {
          ...{ updatedName, id: measure.id, dimensionType: DimensionType.Measure },
          errors,
          revisit
        });
        return;
      }
      const metadata: DimensionMetadataDTO = { name: updatedName, language: req.language };
      try {
        await req.pubapi.updateMeasureMetadata(dataset.id, metadata);
        res.redirect(req.buildUrl(`/publish/${req.params.datasetId}/tasklist`, req.language));
        return;
      } catch (err) {
        const error = err as ApiException;
        logger.error(`Something went wrong trying to name the dimension with the following error: ${err}`);
        errors = {
          status: error.status || 500,
          errors: [
            {
              field: '',
              message: {
                key: 'errors.dimension.naming_failed'
              }
            }
          ],
          dataset_id: req.params.datasetId
        };
        res.status(500);
        res.render('publish/dimension-name', {
          ...{ updatedName, id: measure.id, dimensionType: DimensionType.Measure },
          errors,
          revisit
        });
        return;
      }
    }

    res.render('publish/dimension-name', {
      ...{ dimensionName: measureName, id: measure.id, dimensionType: DimensionType.Measure },
      revisit
    });
  } catch (err) {
    logger.error(`Failed to get dimension name with the following error: ${err}`);
    next(new NotFoundException());
  }
};

export const dimensionName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
    if (!dimension) {
      logger.error('Failed to find dimension in dataset');
      next(new NotFoundException());
      return;
    }
    const revisit = Boolean(req.path.indexOf('change') > -1);
    const columnName = revisit ? dimension.metadata?.name : dimension.factTableColumn;
    const dimensionName = revisit ? dimension.metadata?.name : '';
    if (req.method === 'POST') {
      // TODO Replace validation if statements with an Express Validator
      //  See https://github.com/Marvell-Consulting/statswales-frontend/pull/138
      const updatedName = req.body.name;
      if (!updatedName || updatedName.trim().length < 1) {
        logger.error('User failed to submit a name');
        res.status(400);
        res.render('publish/dimension-name', {
          ...{ columnName, updatedName, id: dimension.id, dimensionType: dimension.type },
          errors: [
            {
              field: 'name',
              message: {
                key: 'errors.dimension.name_missing'
              }
            }
          ],
          revisit
        });
        return;
      }
      if (updatedName.length > 256) {
        logger.error(`Dimension name is too long... length: ${req.body.name.length}`);
        res.status(400);
        res.render('publish/dimension-name', {
          ...{ columnName, updatedName, id: dimension.id, dimensionType: dimension.type },
          errors: [
            {
              field: 'name',
              message: {
                key: 'errors.dimension.name_too_long'
              }
            }
          ],
          revisit
        });
        return;
      } else if (!dimensionColumnNameRegex.test(updatedName)) {
        logger.error(`Dimension name contains characters which aren't allowed.`);
        res.status(400);
        res.render('publish/dimension-name', {
          ...{ columnName, updatedName, id: dimension.id, dimensionType: dimension.type },
          errors: [
            {
              field: 'name',
              message: {
                key: 'errors.dimension.illegal_characters'
              }
            }
          ],
          revisit
        });
        return;
      }
      const metadata: DimensionMetadataDTO = { name: updatedName, language: req.language };
      try {
        await req.pubapi.updateDimensionMetadata(dataset.id, dimension.id, metadata);
        res.redirect(req.buildUrl(`/publish/${req.params.datasetId}/tasklist`, req.language));
        return;
      } catch (err) {
        logger.error(`Something went wrong trying to name the dimension with the following error: ${err}`);
        res.status(500);
        res.render('publish/dimension-name', {
          ...{ columnName, dimensionName, id: dimension.id, dimensionType: dimension.type },
          errors: [
            {
              field: '',
              message: {
                key: 'errors.dimension.naming_failed'
              }
            }
          ],
          revisit
        });
        return;
      }
    }

    res.render('publish/dimension-name', {
      ...{ columnName, dimensionName, id: dimension.id, dimensionType: dimension.type },
      revisit,
      showCancelButton: Boolean(req.path.indexOf('change') > -1)
    });
  } catch (err) {
    logger.error(`Failed to get dimension name with the following error: ${err}`);
    next(new NotFoundException());
  }
};

export const pointInTimeChooser = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
  if (!dimension) {
    logger.error('Failed to find dimension in dataset');
    next(new NotFoundException());
    return;
  }

  if (req.method === 'POST') {
    const patchRequest: DimensionPatchDTO = {
      dimension_id: req.params.dimensionId,
      date_format: req.body.dateFormat,
      dimension_type: DimensionType.Date,
      date_type: YearType.PointInTime
    };
    try {
      await req.pubapi.patchDimension(dataset.id, dimension.id, patchRequest);
      logger.debug('Matching complete for specific point in time... Redirecting to review.');
      res.redirect(
        req.buildUrl(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/review`, req.language)
      );
      return;
    } catch (err) {
      const error = err as ApiException;
      logger.debug(`Error is: ${JSON.stringify(error, null, 2)}`);
      if (error.status === 400) {
        res.status(400);
        logger.error('Date dimension had inconsistent formats than supplied by the user.', err);
        const failurePreview = JSON.parse(error.body as string) as ViewErrDTO;
        res.render('publish/period-match-failure', { ...failurePreview, patchRequest, dimension });
        return;
      }
      logger.error('Something went wrong other than not matching');
      res.redirect(
        req.buildUrl(`/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/point-in-time/`, req.language)
      );
      return;
    }
  }
  res.render('publish/specific-date-chooser', { dimension });
};

export const periodOfTimeChooser = async (req: Request, res: Response, next: NextFunction) => {
  const dimension = singleLangDataset(res.locals.dataset, req.language).dimensions?.find(
    (dim) => dim.id === req.params.dimensionId
  );
  if (!dimension) {
    logger.error('Failed to find dimension in dataset');
    next(new NotFoundException());
    return;
  }

  if (req.method === 'POST') {
    switch (req.body.dimensionType) {
      case 'years':
        res.redirect(
          req.buildUrl(
            `/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/point-in-time/years`,
            req.language
          )
        );
        return;
      case 'quarters':
        res.redirect(
          req.buildUrl(
            `/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/point-in-time/quarters`,
            req.language
          )
        );
        return;
      case 'months':
        res.redirect(
          req.buildUrl(
            `/publish/${req.params.datasetId}/dates/${req.params.dimensionId}/point-in-time/months`,
            req.language
          )
        );
    }
  }

  res.render('publish/period-type');
};

export const changeData = async (req: Request, res: Response) => {
  if (req.method === 'POST') {
    if (req.body.change === 'table') {
      res.redirect(req.buildUrl(`/publish/${req.params.datasetId}/upload`, req.language));
      return;
    }
    if (req.body.change === 'columns') {
      res.redirect(req.buildUrl(`/publish/${req.params.datasetId}/sources`, req.language));
      return;
    }
  }
  res.render('publish/change-data');
};

export const provideSummary = async (req: Request, res: Response) => {
  let errors: ViewError[] | undefined;
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.draft_revision;
  let summary = revision?.metadata?.summary;

  if (req.method === 'POST') {
    try {
      summary = req.body.summary;

      errors = (await getErrors(summaryValidator(), req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `publish.summary.form.description.error.missing` } };
      });

      if (errors.length > 0) {
        res.status(400);
        throw new Error();
      }

      await req.pubapi.updateMetadata(dataset.id, { summary, language: req.language });
      res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
      return;
    } catch (err) {
      if (err instanceof ApiException) {
        errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
      }
    }
  }

  res.render('publish/summary', { summary, errors });
};

export const provideCollection = async (req: Request, res: Response) => {
  let errors: ViewError[] | undefined;
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.draft_revision;
  let collection = revision?.metadata?.collection;

  if (req.method === 'POST') {
    try {
      collection = req.body.collection;

      errors = (await getErrors(collectionValidator(), req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `publish.collection.form.collection.error.missing` } };
      });

      if (errors.length > 0) {
        res.status(400);
        throw new Error();
      }

      await req.pubapi.updateMetadata(dataset.id, { collection, language: req.language });
      res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
      return;
    } catch (err) {
      if (err instanceof ApiException) {
        errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
      }
    }
  }

  res.render('publish/collection', { collection, errors });
};

export const provideQuality = async (req: Request, res: Response) => {
  let errors: ViewError[] | undefined;
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.draft_revision;
  let metadata = {
    quality: revision?.metadata?.quality,
    rounding_applied: revision?.rounding_applied,
    rounding_description: revision?.metadata?.rounding_description
  };

  if (req.method === 'POST') {
    try {
      metadata = {
        quality: req.body.quality,
        rounding_applied: req.body.rounding_applied ? req.body.rounding_applied === 'true' : undefined,
        rounding_description: req.body.rounding_applied === 'true' ? req.body.rounding_description : ''
      };

      const validators = [qualityValidator(), roundingAppliedValidator(), roundingDescriptionValidator()];

      errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `publish.quality.form.${error.path}.error.missing` } };
      });

      if (errors.length > 0) {
        res.status(400);
        throw new Error();
      }

      await req.pubapi.updateMetadata(dataset.id, { ...metadata, language: req.language });
      res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
      return;
    } catch (err) {
      if (err instanceof ApiException) {
        errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
      }
    }
  }

  res.render('publish/quality', { ...metadata, errors });
};

export const provideUpdateFrequency = async (req: Request, res: Response) => {
  let errors: ViewError[] | undefined;
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.draft_revision;
  let update_frequency = revision?.update_frequency;

  if (req.method === 'POST') {
    update_frequency = {
      is_updated: req.body.is_updated ? req.body.is_updated === 'true' : undefined,
      frequency_unit: req.body.is_updated === 'true' ? req.body.frequency_unit : undefined,
      frequency_value: req.body.is_updated === 'true' ? req.body.frequency_value : undefined
    };

    try {
      const validators = [isUpdatedValidator(), frequencyValueValidator(), frequencyUnitValidator()];

      errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
        return {
          field: error.path,
          message: { key: `publish.update_frequency.form.${error.path}.error.missing` }
        };
      });

      if (errors.length > 0) {
        res.status(400);
        throw new Error();
      }

      const { is_updated, frequency_unit, frequency_value } = matchedData(req);

      update_frequency = {
        is_updated,
        frequency_unit: is_updated ? frequency_unit : undefined,
        frequency_value: is_updated ? frequency_value : undefined
      };

      await req.pubapi.updateMetadata(dataset.id, { update_frequency, language: req.language });
      res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
      return;
    } catch (err) {
      if (err instanceof ApiException) {
        errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
      }
    }
  }

  res.render('publish/update-frequency', { ...update_frequency, unitOptions: Object.values(DurationUnit), errors });
};

export const provideDataProviders = async (req: Request, res: Response, next: NextFunction) => {
  const deleteId = req.query.delete;
  const editId = req.query.edit;
  let availableProviders: ProviderDTO[] = [];
  let dataProviders: RevisionProviderDTO[] = [];
  let errors: ViewError[] | undefined;

  try {
    [availableProviders, dataProviders] = await Promise.all([
      req.pubapi.getAllProviders(),
      req.pubapi.getAssignedProviders(res.locals.datasetId)
    ]);
  } catch (err) {
    next(err);
    return;
  }

  let dataset = {
    ...res.locals.dataset,
    draft_revision: {
      ...res.locals.dataset.draft_revision,
      providers: sortBy(dataProviders || [], 'created_at')
    }
  };

  dataset = singleLangDataset(dataset, req.language);
  dataProviders = dataset.draft_revision.providers;

  let availableSources: ProviderSourceDTO[] = [];
  let dataProvider: RevisionProviderDTO | undefined;

  if (deleteId) {
    try {
      dataProviders = dataProviders.filter((dp) => dp.id !== deleteId);
      await req.pubapi.updateAssignedProviders(dataset.id, dataProviders);
      res.redirect(req.buildUrl(`/publish/${dataset.id}/providers`, req.language));
      return;
    } catch (err) {
      next(err);
      return;
    }
  }

  if (editId && editId !== 'new') {
    try {
      dataProvider = dataProviders.find((dp) => dp.id === editId)!;
      availableSources = await req.pubapi.getSourcesByProvider(dataProvider.provider_id);
    } catch (err) {
      next(err);
      return;
    }
  }

  if (req.method === 'POST') {
    try {
      const { add_another, add_provider, provider_id, add_source, source_id } = req.body;

      if (add_provider === 'true') {
        res.redirect(req.buildUrl(`/publish/${dataset.id}/providers?edit=new`, req.language));
        return;
      }

      if (add_provider === 'false') {
        res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
        return;
      }

      if (add_source === 'false') {
        res.redirect(req.buildUrl(`/publish/${dataset.id}/providers`, req.language));
        return;
      }

      if (add_another === 'true' && !add_provider) {
        res.status(400);
        throw new Error('publish.providers.list.form.add_another.error.missing');
      }

      const validProvider = availableProviders.find((provider) => provider.id === provider_id);

      if (!provider_id || !validProvider) {
        res.status(400);
        throw new Error('publish.providers.add.form.provider.error.missing');
      }

      if (editId && editId !== 'new' && !add_source) {
        res.status(400);
        throw new Error('publish.providers.add_source.form.has_source.error.missing');
      }

      if (add_source === 'true') {
        logger.debug('Adding a data provider source');
        const validSource = availableSources.find((source) => source.id === source_id);

        if (!source_id || !validSource) {
          res.status(400);
          throw new Error('publish.providers.add_source.form.source.error.missing');
        }

        const providerIdx = dataProviders.findIndex((dp) => dp.id === editId);
        dataProviders[providerIdx].source_id = source_id;
        await req.pubapi.updateAssignedProviders(dataset.id, dataProviders);
        res.redirect(req.buildUrl(`/publish/${dataset.id}/providers`, req.language));
        return;
      }

      logger.debug('Adding a new data provider');

      // create a new data provider - generate id on the frontend so we can redirect the user to add sources
      dataProvider = { id: uuid(), revision_id: dataset.draft_revision.id, provider_id, language: req.language };

      await req.pubapi.addDatasetProvider(dataset.id, dataProvider);
      res.redirect(req.buildUrl(`/publish/${dataset.id}/providers?edit=${dataProvider.id}`, req.language));
      return;
    } catch (err: any) {
      errors = [{ field: 'provider', message: { key: err.message } }];
    }
  }

  res.render('publish/providers', {
    editId, // id of the data provider being edited
    dataProvider, // current data provider being edited (if editId is set)
    dataProviders, // list of assigned data providers
    availableProviders, // list of all available providers
    availableSources, // list of sources for the selected provider,
    addSource: errors && errors[0]?.message?.key === 'errors.provider_source.missing', // whether to show the source dropdown
    errors
  });
};

export const provideRelatedLinks = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.draft_revision;
  const deleteId = req.query.delete;
  const editId = req.query.edit;
  const now = new Date().toISOString();

  let errors: ViewError[] | undefined;
  let related_links = sortBy(revision?.related_links || [], 'created_at');
  let link: RelatedLinkDTO = { id: nanoid(4), url: '', label_en: '', label_cy: '', created_at: now };

  if (deleteId) {
    try {
      related_links = related_links.filter((rl) => rl.id !== deleteId);
      await req.pubapi.updateMetadata(dataset.id, { related_links, language: req.language });
      res.redirect(req.buildUrl(`/publish/${dataset.id}/related`, req.language));
      return;
    } catch (_err) {
      next(new UnknownException());
      return;
    }
  }

  if (editId && editId !== 'new') {
    const existingLink = related_links.find((rl) => rl.id === editId);
    if (existingLink) {
      link = existingLink;
    } else {
      // shouldn't happen unless someone changes the query param to an id that doesn't exist
      errors = [{ field: 'related_link', message: { key: 'errors.related_link.missing' } }];
    }
  }

  if (req.method === 'POST') {
    const { add_another, add_link, link_id, link_url, link_label } = req.body;
    if (add_link === 'true') {
      res.redirect(req.buildUrl(`/publish/${dataset.id}/related?edit=new`, req.language));
      return;
    }

    if (add_link === 'false') {
      res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
      return;
    }

    // redisplay the form with submitted values if there are errors
    link = {
      id: link_id,
      url: link_url,
      label_en: req.language.includes(Locale.English) ? link_label : link.label_en,
      label_cy: req.language.includes(Locale.Welsh) ? link_label : link.label_cy,
      created_at: link.created_at
    };

    try {
      if (add_another === 'true' && !add_link) {
        res.status(400);
        errors = [{ field: 'add_another', message: { key: 'publish.related.list.form.add_another.error.missing' } }];
        throw new Error();
      }

      errors = (await getErrors([linkIdValidator(), linkUrlValidator(), linkLabelValidator()], req)).map(
        (error: FieldValidationError) => {
          return {
            field: error.path,
            message: {
              key: `publish.related.add.form.${error.path}.error.${error.value ? 'invalid' : 'missing'}`
            }
          };
        }
      );

      if (errors.length > 0) {
        res.status(400);
        throw new Error();
      }

      const { link_id, link_url, link_label } = matchedData(req);
      link = {
        id: link_id,
        url: link_url,
        label_en: req.language.includes(Locale.English) ? link_label : link.label_en,
        label_cy: req.language.includes(Locale.Welsh) ? link_label : link.label_cy,
        created_at: link.created_at
      };

      // if the link already exists, replace it, otherwise add it, then sort
      related_links = sortBy([...related_links.filter((rl) => rl.id !== link.id), link], 'created_at');

      await req.pubapi.updateMetadata(dataset.id, { related_links, language: req.language });
      res.redirect(req.buildUrl(`/publish/${dataset.id}/related`, req.language));
      return;
    } catch (err) {
      if (err instanceof ApiException) {
        errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
      }
    }
  }

  res.render('publish/related-links', { editId, link, related_links, errors });
};

export const provideDesignation = async (req: Request, res: Response) => {
  let errors: ViewError[] | undefined;
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  const revision = dataset.draft_revision;
  let designation = revision?.designation;

  if (req.method === 'POST') {
    try {
      designation = req.body.designation;

      errors = (await getErrors(designationValidator(), req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `publish.designation.form.designation.error.missing` } };
      });

      if (errors.length > 0) {
        res.status(400);
        throw new Error();
      }

      await req.pubapi.updateMetadata(dataset.id, { designation, language: req.language });
      res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
      return;
    } catch (err) {
      if (err instanceof ApiException) {
        errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
      }
    }
  }

  res.render('publish/designation', { designation, designationOptions: Object.values(Designation), errors });
};

export const provideTopics = async (req: Request, res: Response) => {
  const dataset = singleLangDataset(res.locals.dataset, req.language);
  let nestedTopics: NestedTopic[] = [];
  let selectedTopics: number[] = [];
  let errors: ViewError[] | undefined;

  try {
    const [availableTopics, topics] = await Promise.all([
      req.pubapi.getAllTopics(),
      req.pubapi.getDatasetTopics(dataset.id)
    ]);
    nestedTopics = nestTopics(availableTopics);
    selectedTopics = topics?.map((topic: TopicDTO) => topic.id) || [];

    if (req.method === 'POST') {
      errors = (await getErrors(topicIdValidator(), req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `publish.topics.form.topics.error.missing` } };
      });

      if (errors.length > 0) {
        res.status(400);
        throw new Error();
      }

      const topicIds = req.body.topics.filter(Boolean); // strip empty values
      await req.pubapi.updateDatasetTopics(dataset.id, topicIds);
      res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
      return;
    }
  } catch (err) {
    if (err instanceof ApiException) {
      errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
    }
  }

  res.render('publish/topics', { nestedTopics, selectedTopics, errors });
};

export const providePublishDate = async (req: Request, res: Response) => {
  const dataset = res.locals.dataset;
  const revision = dataset.draft_revision;
  let errors: ViewError[] = [];
  let dateError;
  let timeError;
  let values = { year: '', month: '', day: '', hour: '09', minute: '30' };

  if (revision.publish_at) {
    const publishAt = new TZDate(revision.publish_at, 'Europe/London');
    values = {
      year: publishAt.getFullYear().toString(),
      month: (publishAt.getMonth() + 1).toString().padStart(2, '0'),
      day: publishAt.getDate().toString().padStart(2, '0'),
      hour: publishAt.getHours().toString().padStart(2, '0'),
      minute: publishAt.getMinutes().toString().padStart(2, '0')
    };
  }

  if (req.method === 'POST') {
    try {
      const validators = [dayValidator(), monthValidator(), yearValidator(), hourValidator(), minuteValidator()];

      errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `publish.schedule.form.${error.path}.error` } };
      });

      values = {
        year: req.body.year,
        month: req.body.month ? req.body.month.padStart(2, '0') : '',
        day: req.body.day ? req.body.day.padStart(2, '0') : '',
        hour: req.body.hour ? req.body.hour.padStart(2, '0') : '',
        minute: req.body.minute ? req.body.minute.padStart(2, '0') : ''
      };

      const publishDate = new TZDate(
        Number(values.year),
        // month is 0-11
        Number(values.month) - 1,
        Number(values.day),
        Number(values.hour),
        Number(values.minute),
        'Europe/London'
      );

      if (!isValid(publishDate)) {
        dateError = { field: 'date', message: { key: 'publish.schedule.form.date.error.invalid' } };
        errors.push(dateError);
      } else if (isBefore(publishDate, new Date())) {
        dateError = { field: 'date', message: { key: 'publish.schedule.form.date.error.past' } };
        errors.push(dateError);
      }

      if (errors.some((error) => error.field === 'hour' || error.field === 'minute')) {
        timeError = { field: 'time', message: { key: 'publish.schedule.form.time.error.invalid' } };
        errors.push(timeError);
      }

      if (errors.length > 0 || dateError) {
        res.status(400);
        throw new Error('form.validation');
      }

      await req.pubapi.updatePublishDate(dataset.id, revision.id, publishDate.toISOString());
      res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
      return;
    } catch (err) {
      if (err instanceof ApiException) {
        errors = [{ field: 'api', message: { key: 'publish.schedule.error.saving' } }];
      }
    }
  }

  res.render('publish/schedule', { values, errors, dateError, timeError });
};

export const exportTranslations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataset = res.locals.dataset;

    if (req.query.format === 'csv') {
      const fileName = `translations-${dataset.id}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      const translationStream = await req.pubapi.getTranslationExport(dataset.id);
      Readable.from(translationStream).pipe(res);
      return;
    }

    let translations = await req.pubapi.getTranslationPreview(dataset.id);
    translations = addEditLinks(translations, dataset.id, req);
    res.render('publish/translations/export', { translations });
  } catch (_err) {
    next(new UnknownException());
  }
};

const parseUploadedTranslations = async (fileBuffer: Buffer): Promise<TranslationDTO[]> => {
  const translations: TranslationDTO[] = [];

  const csvParser: AsyncIterable<TranslationDTO> = Readable.from(fileBuffer).pipe(
    parse({ bom: true, columns: true, skip_records_with_empty_values: true })
  );

  for await (const row of csvParser) {
    translations.push(row);
  }

  return translations;
};

export const importTranslations = async (req: Request, res: Response) => {
  const dataset = res.locals.dataset;
  let errors: ViewError[] = [];
  let preview = false;
  let translations: TranslationDTO[] = [];

  try {
    if (req.query.confirm === 'true') {
      await req.pubapi.updateTranslations(dataset.id);
      res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
      return;
    }

    if (req.method === 'POST') {
      if (!req.file) {
        errors = [{ field: 'csv', message: { key: 'translations.import.form.file.error.missing' } }];
        throw new Error();
      }

      const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
      await req.pubapi.uploadTranslationImport(dataset.id, fileData);

      preview = true;
      translations = await parseUploadedTranslations(req.file.buffer);
    }
  } catch (err) {
    res.status(400);
    errors.push({ field: 'csv', message: { key: 'translations.import.form.file.error.invalid' } });

    if (err instanceof ApiException) {
      const error = JSON.parse(err.body as string).error;
      if (error.includes('invalid.values')) {
        errors = [{ field: 'csv', message: { key: 'translations.import.form.file.error.values' } }];
      }
    }
  }

  const existingTranslations = await req.pubapi.getTranslationPreview(dataset.id);

  res.render('publish/translations/import', { preview, translations, errors, existingTranslations });
};

export const overview = async (req: Request, res: Response) => {
  const dataset = await req.pubapi.getDataset(res.locals.datasetId, DatasetInclude.All);
  const datasetStatus = getDatasetStatus(dataset);
  const publishingStatus = getPublishingStatus(dataset);
  const revision = singleLangRevision(getLatestRevision(dataset), req.language)!;
  const title = revision.metadata?.title;
  const justScheduled = req.query?.scheduled === 'true';
  const canMoveGroup = getApproverUserGroups(req.user).length > 1;
  let errors: ViewError[] = [];

  if (req.query.withdraw) {
    try {
      await req.pubapi.withdrawFromPublication(dataset.id, revision.id);
      res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
      return;
    } catch (_err) {
      errors = [{ field: 'withdraw', message: { key: 'publish.overview.error.withdraw' } }];
    }
  }

  res.render('publish/overview', {
    dataset,
    revision,
    title,
    justScheduled,
    datasetStatus,
    publishingStatus,
    canMoveGroup,
    errors
  });
};

export const createNewUpdate = async (req: Request, res: Response) => {
  const dataset = res.locals.dataset;

  try {
    await req.pubapi.createRevision(dataset.id);
    res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
  } catch (err) {
    logger.error(err, `Could not create dataset update`);
    res.redirect(req.buildUrl(`/publish/${dataset.id}/overview`, req.language));
  }
};

export const updateDatatable = async (req: Request, res: Response) => {
  const dataset = res.locals.dataset;

  if (req.method === 'POST') {
    if (req.body.updateType) {
      set(req.session, `dataset.${dataset.id}`, { updateType: req.body.updateType });
      req.session.save();
      res.redirect(req.buildUrl(`/publish/${dataset.id}/upload`, req.language));
      return;
    } else {
      res.locals.errors = [{ field: 'updateType', message: { key: 'publish.update_type.errors.missing' } }];
    }
  }
  res.render('publish/update-type');
};

export const moveDatasetGroup = async (req: Request, res: Response, next: NextFunction) => {
  const dataset = res.locals.dataset;
  const availableGroups = getApproverUserGroups(req.user).map((g) => singleLangUserGroup(g.group, req.language)) || [];
  const validGroupIds = availableGroups.map((group) => group.id) as string[];
  let values = { group_id: dataset.user_group_id };
  let errors: ViewError[] = [];

  if (availableGroups.length < 2) {
    next(new NotAllowedException('You must be an approver of more than one group to move a dataset'));
    return;
  }

  if (req.method === 'POST') {
    values = req.body;

    try {
      errors = (await getErrors(groupIdValidator(validGroupIds), req)).map((error: FieldValidationError) => {
        return {
          field: 'group_id',
          message: { key: `publish.group.form.group_id.error.${error.value ? 'invalid' : 'missing'}` }
        };
      });

      if (errors.length > 0) {
        res.status(400);
        throw new Error();
      }

      await req.pubapi.moveDatasetGroup(res.locals.datasetId, values.group_id);
      const groupName = availableGroups.find((group) => group.id === values.group_id)?.name || '';
      req.session.flash = [{ key: `publish.move_group.success`, params: { groupName } }];
      res.redirect(req.buildUrl(`/publish/${dataset.id}/overview`, req.language));
      return;
    } catch (err) {
      if (err instanceof ApiException) {
        errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
      }
    }
  }

  res.render('publish/move-group', { availableGroups, values, errors });
};
