import path from 'node:path';

import { Request, Response, NextFunction } from 'express';
import { snakeCase, sortBy } from 'lodash';
import { FieldValidationError, matchedData } from 'express-validator';
import { nanoid } from 'nanoid';
import { v4 as uuid } from 'uuid';

import { generateViewErrors } from '../utils/generate-view-errors';
import {
    collectionValidator,
    descriptionValidator,
    designationValidator,
    frequencyUnitValidator,
    frequencyValueValidator,
    hasError,
    isUpdatedValidator,
    linkIdValidator,
    linkLabelValidator,
    linkUrlValidator,
    providerIdValidator,
    qualityValidator,
    roundingAppliedValidator,
    roundingDescriptionValidator,
    titleValidator
} from '../validators';
import { ViewError } from '../dtos/view-error';
import { logger } from '../utils/logger';
import { ViewDTO, ViewErrDTO } from '../dtos/view-dto';
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

export const start = (req: Request, res: Response, next: NextFunction) => {
    res.render('publish/start');
};

export const provideTitle = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewErrDTO | undefined;
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
            const error: ViewError = { field: 'title', tag: { name: 'errors.title.missing' } };
            errors = generateViewErrors(undefined, 400, [error]);
        }
    }

    res.render('publish/title', { title, revisit, errors });
};

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    const dataset = res.locals.dataset;
    let errors: ViewErrDTO | undefined;
    const revisit = dataset.dimensions?.length > 0;

    if (req.method === 'POST') {
        try {
            if (!req.file) {
                throw new Error('errors.csv.invalid');
            }
            const fileName = req.file.originalname;
            if (req.file.mimetype === 'application/octet-stream') {
                const ext = path.extname(req.file.originalname);
                switch (ext) {
                    case '.parquet':
                        req.file.mimetype = 'application/vnd.apache.parquet';
                        break;
                    case '.json':
                        req.file.mimetype = 'application/json';
                        break;
                    case '.xls':
                    case '.xlsx':
                        req.file.mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                        break;
                    case '.csv':
                        req.file.mimetype = 'text/csv';
                        break;
                    default:
                        throw new Error(`unsupported format ${ext}`);
                }
            } else if (req.file.mimetype === 'application/x-gzip') {
                const ext = req.file.originalname.split('.').reverse()[1];
                switch (ext) {
                    case 'json':
                    case 'csv':
                        break;
                    default:
                        throw new Error(`unsupported format ${ext}`);
                }
            }
            const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
            await req.swapi.uploadCSVToDataset(dataset.id, fileData, fileName);
            res.redirect(req.buildUrl(`/publish/${dataset.id}/preview`, req.language));
            return;
        } catch (err) {
            res.status(400);
            const error: ViewError = { field: 'csv', tag: { name: 'errors.upload.no_csv_data' } };
            errors = generateViewErrors(undefined, 400, [error]);
        }
    }

    res.render('publish/upload', { revisit, errors });
};

// Special thanks ChatGPT...  The GovUK pagination algorithm
function generateSequenceForNumber(highlight: number, end: number): (string | number)[] {
    const sequence: (string | number)[] = [];

    // Validate input
    if (highlight > end) {
        throw new Error(`Highlighted number must be between 1 and ${end}.`);
    }

    // Numbers before the highlighted number
    if (highlight - 1 > 1) {
        sequence.push(1, '...');
        sequence.push(highlight - 1);
    } else {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        sequence.push(...Array.from({ length: highlight - 1 }, (_, index) => index + 1));
    }

    // Highlighted number
    sequence.push(highlight);

    // Numbers after the highlighted number
    if (highlight + 1 < end) {
        sequence.push(highlight + 1);
        sequence.push('...', end);
    } else {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        sequence.push(...Array.from({ length: end - highlight }, (_, index) => highlight + 1 + index));
    }

    return sequence;
}

export const factTablePreview = async (req: Request, res: Response, next: NextFunction) => {
    const { dataset, revision, factTable } = res.locals;
    let errors: ViewErrDTO | undefined;
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
                res.redirect(req.buildUrl(`/publish/${dataset.id}/upload`, req.language));
            }
            return;
        } catch (err: any) {
            res.status(500);
            const error: ViewError = { field: 'confirm', tag: { name: 'errors.preview.confirm_error' } };
            errors = generateViewErrors(dataset.id, 500, [error]);
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
        const error: ViewError = { field: 'preview', tag: { name: 'errors.preview.failed_to_get_preview' } };
        errors = generateViewErrors(undefined, 400, [error]);
    }
    res.render('publish/preview', { ...previewData, ignoredCount, pagination, revisit, errors });
};

export const sources = async (req: Request, res: Response, next: NextFunction) => {
    const { dataset, revision, factTable } = res.locals;
    const revisit =
        factTable.fact_table_info?.filter((factTableInfo: FactTableInfoDto) => Boolean(factTableInfo.column_type))
            .length > 0;
    let error: ViewError | undefined;
    let errors: ViewErrDTO | undefined;
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
                error = { field: 'source', tag: { name: 'errors.sources.unknowns_found' } };
            }

            if (counts.dataValues > 1) {
                logger.error('User tried to specify multiple data value sources');
                error = { field: 'source', tag: { name: 'errors.sources.multiple_datavalues' } };
            }

            if (counts.footnotes > 1) {
                logger.error('User tried to specify multiple footnote sources');
                error = { field: 'source', tag: { name: 'errors.sources.multiple_footnotes' } };
            }

            if (counts.measure > 1) {
                logger.error('User tried to specify multiple measure sources');
                error = { field: 'source', tag: { name: 'errors.sources.multiple_measures' } };
            }

            if (error) {
                errors = generateViewErrors(undefined, 400, [error]);
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
    let errors: ViewErrDTO | undefined;
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
            const error: ViewError = { field: 'description', tag: { name: 'errors.description.missing' } };
            errors = generateViewErrors(undefined, 400, [error]);
        }
    }

    res.render('publish/summary', { description, errors });
};

export const provideCollection = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewErrDTO | undefined;
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
            const error: ViewError = { field: 'collection', tag: { name: 'errors.collection.missing' } };
            errors = generateViewErrors(undefined, 400, [error]);
        }
    }

    res.render('publish/collection', { collection, errors });
};

export const provideQuality = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewErrDTO | undefined;
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
                const error: ViewError = { field: err.path, tag: { name: `errors.${snakeCase(err.path)}.missing` } };
                errors = generateViewErrors(dataset.id, 400, [error]);
            } else {
                next(new UnknownException());
                return;
            }
        }
    }

    res.render('publish/quality', { ...datasetInfo, errors });
};

export const provideUpdateFrequency = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewErrDTO | undefined;
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
            const error: ViewError = { field: 'update_frequency', tag: { name: 'errors.update_frequency.missing' } };
            errors = generateViewErrors(undefined, 400, [error]);
        }
    }

    res.render('publish/update-frequency', { ...update_frequency, unitOptions: Object.values(DurationUnit), errors });
};

export const provideDataProviders = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewErrDTO | undefined;
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
        const { add_provider, add_source, provider_id, source_id } = req.body;

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

        try {
            const validProvider = availableProviders.find((provider) => provider.id === provider_id);

            if (!provider_id || !validProvider) {
                res.status(400);
                throw new Error('errors.provider.missing');
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
        } catch (err) {
            const error: ViewError = { field: 'related_link', tag: { name: 'errors.related_link.required' } };
            errors = generateViewErrors(undefined, 400, [error]);
        }
    }

    res.render('publish/providers', {
        editId, // id of the data provider being edited
        dataProvider, // current data provider being edited (if editId is set)
        dataProviders, // list of assigned data providers
        availableProviders, // list of all available providers
        availableSources, // list of sources for the selected provider
        errors
    });
};

export const provideRelatedLinks = async (req: Request, res: Response, next: NextFunction) => {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    let errors: ViewErrDTO | undefined;
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
            const error: ViewError = { field: 'related_link', tag: { name: 'errors.related_link.missing' } };
            errors = generateViewErrors(dataset.id, 400, [error]);
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
            const error: ViewError = { field: 'related_link', tag: { name: 'errors.related_link.required' } };
            errors = generateViewErrors(undefined, 400, [error]);
        }
    }

    res.render('publish/related-links', { editId, link, related_links, errors });
};

export const provideDesignation = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewErrDTO | undefined;
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
            const error: ViewError = { field: 'designation', tag: { name: 'errors.designation.missing' } };
            errors = generateViewErrors(undefined, 400, [error]);
        }
    }

    res.render('publish/designation', { designation, designationOptions: Object.values(Designation), errors });
};
