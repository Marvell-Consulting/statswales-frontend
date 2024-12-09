import { Request, Response, NextFunction } from 'express';
import { snakeCase, sortBy, uniqBy } from 'lodash';
import { FieldValidationError, matchedData } from 'express-validator';
import { nanoid } from 'nanoid';
import { v4 as uuid } from 'uuid';
import { isBefore, isValid, parseISO } from 'date-fns';

import {
    collectionValidator,
    dayValidator,
    descriptionValidator,
    designationValidator,
    frequencyUnitValidator,
    frequencyValueValidator,
    getErrors,
    hasError,
    hourValidator,
    isUpdatedValidator,
    linkIdValidator,
    linkLabelValidator,
    linkUrlValidator,
    minuteValidator,
    monthValidator,
    organisationIdValidator,
    qualityValidator,
    roundingAppliedValidator,
    roundingDescriptionValidator,
    teamIdValidator,
    titleValidator,
    topicIdValidator,
    yearValidator
} from '../validators';
import { ViewError } from '../dtos/view-error';
import { logger } from '../utils/logger';
import { ViewDTO } from '../dtos/view-dto';
import { SourceType } from '../enums/source-type';
import { FactTableInfoDto } from '../dtos/fact-table-info';
import { SourceAssignmentDTO } from '../dtos/source-assignment-dto';
import { UnknownException } from '../exceptions/unknown.exception';
import { TaskListState } from '../dtos/task-list-state';
import { NotFoundException } from '../exceptions/not-found.exception';
import { statusToColour } from '../utils/status-to-colour';
import { singleLangDataset } from '../utils/single-lang-dataset';
import { updateSourceTypes } from '../utils/update-source-types';
import { Designation } from '../enums/designation';
import { DurationUnit } from '../enums/duration-unit';
import { RelatedLinkDTO } from '../dtos/related-link';
import { DatasetProviderDTO } from '../dtos/dataset-provider';
import { ProviderSourceDTO } from '../dtos/provider-source';
import { ProviderDTO } from '../dtos/provider';
import { generateSequenceForNumber } from '../utils/pagination';
import { fileMimeTypeHandler } from '../utils/file-mimetype-handler';
import { TopicDTO } from '../dtos/topic';
import { DatasetTopicDTO } from '../dtos/dataset-topic';
import { nestTopics } from '../utils/nested-topics';
import { ApiException } from '../exceptions/api.exception';
import { OrganisationDTO } from '../dtos/organisation';
import { TeamDTO } from '../dtos/team';

export const start = (req: Request, res: Response, next: NextFunction) => {
    res.render('publish/start');
};

export const provideTitle = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewError[] | undefined;
    const existingDataset = res.locals.dataset; // dataset does not exist the first time through
    let title = existingDataset ? singleLangDataset(existingDataset, req.language)?.datasetInfo?.title : undefined;
    const revisit = Boolean(existingDataset);

    if (req.method === 'POST') {
        try {
            const titleError = await hasError(titleValidator(), req);
            if (titleError) {
                res.status(400);
                throw new Error('errors.title.missing');
            }

            title = req.body.title;

            if (existingDataset) {
                await req.swapi.updateDatasetInfo(existingDataset.id, { title, language: req.language });
                res.redirect(req.buildUrl(`/publish/${existingDataset.id}/tasklist`, req.language));
            } else {
                const dataset = await req.swapi.createDataset(title, req.language);
                res.redirect(req.buildUrl(`/publish/${dataset.id}/upload`, req.language));
            }
            return;
        } catch (err) {
            errors = [{ field: 'title', message: { key: 'errors.title.missing' } }];
        }
    }

    res.render('publish/title', { title, revisit, errors });
};

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    const dataset = res.locals.dataset;
    let errors: ViewError[] | undefined;
    const revisit = dataset.dimensions?.length > 0;

    if (req.method === 'POST') {
        try {
            if (!req.file) {
                throw new Error('errors.csv.invalid');
            }
            const fileName = req.file.originalname;
            req.file.mimetype = fileMimeTypeHandler(req.file.mimetype, req.file.originalname);
            const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
            await req.swapi.uploadCSVToDataset(dataset.id, fileData, fileName);
            res.redirect(req.buildUrl(`/publish/${dataset.id}/preview`, req.language));
            return;
        } catch (err) {
            res.status(400);
            errors = [{ field: 'csv', message: { key: 'errors.upload.no_csv_data' } }];
        }
    }

    res.render('publish/upload', { revisit, errors });
};

export const factTablePreview = async (req: Request, res: Response, next: NextFunction) => {
    const { dataset, revision, factTable } = res.locals;
    let errors: ViewError[] | undefined;
    let previewData: ViewDTO | undefined;
    let ignoredCount = 0;
    let pagination: (string | number)[] = [];

    if (!dataset || !revision || !factTable) {
        logger.error('Fact table not found');
        next(new UnknownException('errors.preview.import_missing'));
        return;
    }

    // if sources have previously been assigned a type, this is a revisit
    const revisit =
        factTable.fact_table_info?.filter((factTableInfo: FactTableInfoDto) => Boolean(factTableInfo.column_type))
            .length > 0;

    if (req.method === 'POST') {
        try {
            if (req.body.confirm === 'true') {
                await req.swapi.confirmFileImport(dataset.id, revision.id, factTable.id);
                res.redirect(req.buildUrl(`/publish/${dataset.id}/sources`, req.language));
            } else {
                // IF the user says it's the wrong file... clean up after them!
                // Post MVP we can add an extra screen asking them to confirm which
                // is when the delete happens actually happens.
                await req.swapi.removeFileImport(dataset.id, revision.id, factTable.id);
                res.redirect(req.buildUrl(`/publish/${dataset.id}/upload`, req.language));
            }
            return;
        } catch (err: any) {
            res.status(500);
            errors = [{ field: 'confirm', message: { key: 'errors.preview.confirm_error' } }];
        }
    }

    try {
        const pageNumber = Number.parseInt(req.query.page_number as string, 10) || 1;
        const pageSize = Number.parseInt(req.query.page_size as string, 10) || 10;
        previewData = await req.swapi.getImportPreview(dataset.id, revision.id, factTable.id, pageNumber, pageSize);
        ignoredCount = previewData.headers.filter((header) => header.source_type === SourceType.Ignore).length;
        if (!previewData) {
            throw new Error('No preview data found.');
        }
        pagination = generateSequenceForNumber(previewData.current_page, previewData.total_pages);
    } catch (err: any) {
        res.status(400);
        errors = [{ field: 'preview', message: { key: 'errors.preview.failed_to_get_preview' } }];
    }
    res.render('publish/preview', { ...previewData, ignoredCount, pagination, revisit, errors });
};

export const sources = async (req: Request, res: Response, next: NextFunction) => {
    const { dataset, revision, factTable } = res.locals;
    const revisit =
        factTable.fact_table_info?.filter((factTableInfo: FactTableInfoDto) => Boolean(factTableInfo.column_type))
            .length > 0;
    let error: ViewError | undefined;
    let errors: ViewError[] | undefined;
    let currentImport = factTable;

    try {
        if (!dataset || !revision || !factTable) {
            logger.error('Fact table not found');
            throw new Error('errors.preview.import_missing');
        }

        if (req.method === 'POST') {
            const counts = { unknown: 0, dataValues: 0, footnotes: 0, measure: 0 };
            const sourceAssignment: SourceAssignmentDTO[] = factTable.fact_table_info.map(
                (factTableInfo: FactTableInfoDto) => {
                    const sourceType = req.body[`column-${factTableInfo.column_index}`];
                    if (sourceType === SourceType.Unknown) counts.unknown++;
                    if (sourceType === SourceType.DataValues) counts.dataValues++;
                    if (sourceType === SourceType.NoteCodes) counts.footnotes++;
                    if (sourceType === SourceType.Measure) counts.measure++;
                    return {
                        column_index: factTableInfo.column_index,
                        column_name: factTableInfo.column_name,
                        column_type: sourceType
                    };
                }
            );

            currentImport = updateSourceTypes(factTable, sourceAssignment);

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
                errors = [error];
                res.status(400);
            } else {
                await req.swapi.assignSources(dataset.id, revision.id, factTable.id, sourceAssignment);
                res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
                return;
            }
        }
    } catch (err: any) {
        logger.error(`There was a problem assigning source types`, err);
        next(new UnknownException());
        return;
    }

    res.render('publish/sources', {
        currentImport,
        sourceTypes: Object.values(SourceType),
        revisit,
        errors
    });
};

export const taskList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const datasetTitle = singleLangDataset(res.locals.dataset, req.language).datasetInfo?.title;
        const taskList: TaskListState = await req.swapi.getTaskList(res.locals.datasetId);
        res.render('publish/tasklist', { datasetTitle, taskList, statusToColour });
    } catch (err) {
        logger.error('Failed to get tasklist', err);
        next(new NotFoundException());
    }
};

export const redirectToTasklist = (req: Request, res: Response) => {
    res.redirect(req.buildUrl(`/publish/${req.params.datasetId}/tasklist`, req.language));
};

export const changeData = async (req: Request, res: Response, next: NextFunction) => {
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

export const provideSummary = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewError[] | undefined;
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    let description = dataset?.datasetInfo?.description;

    if (req.method === 'POST') {
        try {
            const descriptionError = await hasError(descriptionValidator(), req);
            if (descriptionError) {
                res.status(400);
                throw new Error('errors.description.missing');
            }

            description = req.body.description;

            await req.swapi.updateDatasetInfo(dataset.id, { description, language: req.language });
            res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
            return;
        } catch (err) {
            const error: ViewError = { field: 'description', message: { key: 'errors.description.missing' } };
            errors = [error];
        }
    }

    res.render('publish/summary', { description, errors });
};

export const provideCollection = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewError[] | undefined;
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    let collection = dataset?.datasetInfo?.collection;

    if (req.method === 'POST') {
        try {
            const collectionError = await hasError(collectionValidator(), req);
            if (collectionError) {
                res.status(400);
                throw new Error('errors.collection.missing');
            }

            collection = req.body.collection;

            await req.swapi.updateDatasetInfo(dataset.id, { collection, language: req.language });
            res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
            return;
        } catch (err) {
            const error: ViewError = { field: 'collection', message: { key: 'errors.collection.missing' } };
            errors = [error];
        }
    }

    res.render('publish/collection', { collection, errors });
};

export const provideQuality = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewError[] | undefined;
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    let datasetInfo = dataset?.datasetInfo!;

    if (req.method === 'POST') {
        try {
            datasetInfo = {
                quality: req.body.quality,
                rounding_applied: req.body.rounding_applied ? req.body.rounding_applied === 'true' : undefined,
                rounding_description: req.body.rounding_applied === 'true' ? req.body.rounding_description : ''
            };

            for (const validator of [qualityValidator(), roundingAppliedValidator(), roundingDescriptionValidator()]) {
                const result = await validator.run(req);
                if (!result.isEmpty()) {
                    res.status(400);
                    const error = result.array()[0] as FieldValidationError;
                    throw error;
                }
            }

            await req.swapi.updateDatasetInfo(dataset.id, { ...datasetInfo, language: req.language });
            res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
            return;
        } catch (err: any) {
            if (err.path) {
                const error: ViewError = { field: err.path, message: { key: `errors.${snakeCase(err.path)}.missing` } };
                errors = [error];
            } else {
                next(new UnknownException());
                return;
            }
        }
    }

    res.render('publish/quality', { ...datasetInfo, errors });
};

export const provideUpdateFrequency = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewError[] | undefined;
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    let update_frequency = dataset?.datasetInfo!.update_frequency;

    if (req.method === 'POST') {
        update_frequency = {
            is_updated: req.body.is_updated ? req.body.is_updated === 'true' : undefined,
            frequency_unit: req.body.is_updated === 'true' ? req.body.frequency_unit : undefined,
            frequency_value: req.body.is_updated === 'true' ? req.body.frequency_value : undefined
        };

        try {
            for (const validator of [isUpdatedValidator(), frequencyValueValidator(), frequencyUnitValidator()]) {
                const result = await validator.run(req);
                if (!result.isEmpty()) {
                    res.status(400);
                    const error = result.array()[0] as FieldValidationError;
                    throw error;
                }
            }

            const { is_updated, frequency_unit, frequency_value } = matchedData(req);

            update_frequency = {
                is_updated,
                frequency_unit: is_updated ? frequency_unit : undefined,
                frequency_value: is_updated ? frequency_value : undefined
            };

            await req.swapi.updateDatasetInfo(dataset.id, { update_frequency, language: req.language });
            res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
            return;
        } catch (err) {
            const error: ViewError = { field: 'update_frequency', message: { key: 'errors.update_frequency.missing' } };
            errors = [error];
        }
    }

    res.render('publish/update-frequency', { ...update_frequency, unitOptions: Object.values(DurationUnit), errors });
};

export const provideDataProviders = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewError[] | undefined;
    const availableProviders: ProviderDTO[] = await req.swapi.getAllProviders();
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const deleteId = req.query.delete;
    const editId = req.query.edit;
    let dataProviders: DatasetProviderDTO[] = sortBy(dataset?.providers || [], 'created_at');
    let availableSources: ProviderSourceDTO[] = [];
    let dataProvider: DatasetProviderDTO | undefined;

    if (deleteId) {
        try {
            dataProviders = dataProviders.filter((dp) => dp.id !== deleteId);
            await req.swapi.updateDatasetProviders(dataset.id, dataProviders);
            res.redirect(req.buildUrl(`/publish/${dataset.id}/providers`, req.language));
            return;
        } catch (err) {
            next(new UnknownException());
            return;
        }
    }

    if (editId && editId !== 'new') {
        try {
            dataProvider = dataProviders.find((dp) => dp.id === editId)!;
            availableSources = await req.swapi.getSourcesByProvider(dataProvider.provider_id);
        } catch (err) {
            next(new UnknownException());
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
                throw new Error('errors.provider.add_another');
            }

            const validProvider = availableProviders.find((provider) => provider.id === provider_id);

            if (!provider_id || !validProvider) {
                res.status(400);
                throw new Error('errors.provider.missing');
            }

            if (editId && editId !== 'new' && !add_source) {
                res.status(400);
                throw new Error('errors.provider_source.has_source');
            }

            if (add_source === 'true') {
                logger.debug('Adding a data provider source');
                const validSource = availableSources.find((source) => source.id === source_id);

                if (!source_id || !validSource) {
                    res.status(400);
                    throw new Error('errors.provider_source.missing');
                }

                const providerIdx = dataProviders.findIndex((dp) => dp.id === editId);
                dataProviders[providerIdx].source_id = source_id;
                await req.swapi.updateDatasetProviders(dataset.id, dataProviders);
                res.redirect(req.buildUrl(`/publish/${dataset.id}/providers`, req.language));
                return;
            }

            logger.debug('Adding a new data provider');

            // create a new data provider - generate id on the frontend so we can redirect the user to add sources
            dataProvider = { id: uuid(), dataset_id: dataset.id, provider_id, language: req.language };

            await req.swapi.addDatasetProvider(dataset.id, dataProvider);
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
    let errors: ViewError[] | undefined;
    let related_links = sortBy(dataset?.datasetInfo?.related_links || [], 'created_at');
    const deleteId = req.query.delete;
    const editId = req.query.edit;
    const now = new Date().toISOString();
    let link: RelatedLinkDTO = { id: nanoid(4), url: '', label: '', created_at: now };

    if (deleteId) {
        try {
            related_links = related_links.filter((rl) => rl.id !== deleteId);
            await req.swapi.updateDatasetInfo(dataset.id, { related_links, language: req.language });
            res.redirect(req.buildUrl(`/publish/${dataset.id}/related`, req.language));
            return;
        } catch (err) {
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
        const { add_link, link_id, link_url, link_label } = req.body;
        if (add_link === 'true') {
            res.redirect(req.buildUrl(`/publish/${dataset.id}/related?edit=new`, req.language));
            return;
        }

        if (add_link === 'false') {
            res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
            return;
        }

        // redisplay the form with submitted values if there are errors
        link = { id: link_id, url: link_url, label: link_label, created_at: link.created_at };

        try {
            for (const validator of [linkIdValidator(), linkUrlValidator(), linkLabelValidator()]) {
                const result = await validator.run(req);
                if (!result.isEmpty()) {
                    res.status(400);
                    const error = result.array()[0] as FieldValidationError;
                    throw error;
                }
            }

            const { link_id, link_url, link_label } = matchedData(req);
            link = { id: link_id, url: link_url, label: link_label, created_at: link.created_at };

            // if the link already exists, replace it, otherwise add it, then sort
            related_links = sortBy([...related_links.filter((rl) => rl.id !== link.id), link], 'created_at');

            await req.swapi.updateDatasetInfo(dataset.id, { related_links, language: req.language });
            res.redirect(req.buildUrl(`/publish/${dataset.id}/related`, req.language));
            return;
        } catch (err) {
            const error: ViewError = { field: 'related_link', message: { key: 'errors.related_link.required' } };
            errors = [error];
        }
    }

    res.render('publish/related-links', { editId, link, related_links, errors });
};

export const provideDesignation = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewError[] | undefined;
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    let designation = dataset?.datasetInfo?.designation;

    if (req.method === 'POST') {
        try {
            const designationError = await hasError(designationValidator(), req);
            if (designationError) {
                res.status(400);
                throw new Error('errors.designation.missing');
            }

            designation = req.body.designation;

            await req.swapi.updateDatasetInfo(dataset.id, { designation, language: req.language });
            res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
            return;
        } catch (err) {
            const error: ViewError = { field: 'designation', message: { key: 'errors.designation.missing' } };
            errors = [error];
        }
    }

    res.render('publish/designation', { designation, designationOptions: Object.values(Designation), errors });
};

export const provideTopics = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewError[] | undefined;
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const availableTopics: TopicDTO[] = await req.swapi.getAllTopics();
    const nestedTopics = nestTopics(availableTopics);
    const selectedTopics: number[] = dataset.topics?.map((dt: DatasetTopicDTO) => dt.topic_id) || [];

    if (req.method === 'POST') {
        try {
            const topicError = await hasError(topicIdValidator(), req);

            if (topicError) {
                res.status(400);
                throw new Error('errors.topics.missing');
            }

            const topicIds = req.body.topics.filter(Boolean); // strip empty values
            await req.swapi.updateDatasetTopics(dataset.id, topicIds);
            res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
            return;
        } catch (err) {
            const error: ViewError = { field: 'topics', message: { key: 'errors.topics.missing' } };
            errors = [error];
        }
    }

    res.render('publish/topics', { nestedTopics, selectedTopics, errors });
};

export const providePublishDate = async (req: Request, res: Response, next: NextFunction) => {
    const { dataset, revision } = res.locals;
    let errors: ViewError[] = [];
    let dateError;
    let timeError;
    let values = { year: '', month: '', day: '', hour: '09', minute: '30' };

    if (revision.publish_at) {
        const publishAt = new Date(revision.publish_at);
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

            const publishDate = parseISO(
                `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:00`
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

            await req.swapi.updatePublishDate(dataset.id, revision.id, publishDate.toISOString());
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

export const provideOrganisation = async (req: Request, res: Response, next: NextFunction) => {
    const { dataset } = res.locals;
    let organisations: OrganisationDTO[] = [];
    let teams: TeamDTO[] = [];
    let errors: ViewError[] = [];
    let values = { organisation: '', team: '' };

    try {
        organisations = await req.swapi.getAllOrganisations();
        teams = await req.swapi.getAllTeams();

        if (dataset.team_id) {
            const datasetTeam = teams.find((team) => team.id === dataset.team_id)!;
            values = { organisation: datasetTeam.organisation_id!, team: datasetTeam.id };
        }

        if (req.method === 'POST') {
            values = req.body;
            const validators = [organisationIdValidator(), teamIdValidator()];

            errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
                return { field: error.path, message: { key: `publish.organisation.form.${error.path}.error` } };
            });

            const selectedTeam = teams.find((team) => team.id === values.team);

            if (!selectedTeam) {
                errors.push({ field: 'team', message: { key: 'publish.organisation.form.team.error' } });
            }

            errors = uniqBy(errors, 'field');
            if (errors.length > 0) throw errors;

            await req.swapi.updateDatasetTeam(dataset.id, values.team);
        }
    } catch (err) {
        if (err instanceof ApiException) {
            errors = [{ field: 'api', message: { key: 'publish.organisation.error.saving' } }];
        }
    }

    res.render('publish/organisation', { values, organisations, teams, errors });
};
