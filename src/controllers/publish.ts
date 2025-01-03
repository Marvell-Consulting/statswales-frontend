import { Readable } from 'node:stream';

import { NextFunction, Request, Response } from 'express';
import { snakeCase, sortBy, uniqBy } from 'lodash';
import { FieldValidationError, matchedData } from 'express-validator';
import { nanoid } from 'nanoid';
import { v4 as uuid } from 'uuid';
import { isBefore, isValid, parseISO } from 'date-fns';
import { parse } from 'csv-parse';

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
import { generateSequenceForNumber } from '../utils/pagination';
import { fileMimeTypeHandler } from '../utils/file-mimetype-handler';
import { TopicDTO } from '../dtos/topic';
import { DatasetTopicDTO } from '../dtos/dataset-topic';
import { nestTopics } from '../utils/nested-topics';
import { OrganisationDTO } from '../dtos/organisation';
import { TeamDTO } from '../dtos/team';
import { DimensionType } from '../enums/dimension-type';
import { DimensionPatchDto } from '../dtos/dimension-patch-dto';
import { ApiException } from '../exceptions/api.exception';
import { DimensionInfoDTO } from '../dtos/dimension-info';
import { YearType } from '../enums/year-type';
import { addEditLinks } from '../utils/add-edit-links';
import { TranslationDTO } from '../dtos/translations';

export const start = (req: Request, res: Response, next: NextFunction) => {
    res.render('publish/start');
};

export const dimensionColumnNameRegex = /^[a-zA-ZÀ-ž()\-_ ]+$/;

export const provideTitle = async (req: Request, res: Response, next: NextFunction) => {
    let errors: ViewError[] = [];
    const existingDataset = res.locals.dataset; // dataset does not exist the first time through
    let title = existingDataset ? singleLangDataset(existingDataset, req.language)?.datasetInfo?.title : undefined;
    const revisit = Boolean(existingDataset);

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
                await req.swapi.updateDatasetInfo(existingDataset.id, { title, language: req.language });
                res.redirect(req.buildUrl(`/publish/${existingDataset.id}/tasklist`, req.language));
            } else {
                const dataset = await req.swapi.createDataset(title, req.language);
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

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    const dataset = res.locals.dataset;
    let errors: ViewError[] | undefined;
    const revisit = dataset.dimensions?.length > 0;

    if (req.method === 'POST') {
        logger.debug('User is uploading a fact table.');
        try {
            if (!req.file) {
                logger.error('No file is present in the request');
                throw new Error('errors.csv.invalid');
            }
            const fileName = req.file.originalname;
            req.file.mimetype = fileMimeTypeHandler(req.file.mimetype, req.file.originalname);
            const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
            logger.debug('Sending file to backend.');
            await req.swapi.uploadCSVToDataset(dataset.id, fileData, fileName);
            res.redirect(req.buildUrl(`/publish/${dataset.id}/preview`, req.language));
            return;
        } catch (err) {
            res.status(400);
            errors = [{ field: 'csv', message: { key: 'errors.upload.no_csv_data' } }];
        }
    }

    res.render('publish/upload', { revisit, errors, uploadType: false });
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
        const dimensions = singleLangDataset(res.locals.dataset, req.language).dimensions;
        const taskList: TaskListState = await req.swapi.getTaskList(res.locals.datasetId);
        res.render('publish/tasklist', { datasetTitle, taskList, dimensions, statusToColour });
    } catch (err) {
        logger.error(`Failed to get tasklist with the following error: ${err}`);
        next(new NotFoundException());
    }
};

export const cubePreview = async (req: Request, res: Response, next: NextFunction) => {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const revision = res.locals.revision;
    let errors: ViewError[] | undefined;
    let previewData: ViewDTO | undefined;
    let pagination: (string | number)[] = [];

    if (!dataset || !revision) {
        logger.error('Dataset or Revision not found');
        next(new UnknownException('errors.preview.revision_not_found'));
        return;
    }

    try {
        const pageNumber = Number.parseInt(req.query.page_number as string, 10) || 1;
        const pageSize = Number.parseInt(req.query.page_size as string, 10) || 10;
        previewData = await req.swapi.getRevisionPreview(dataset.id, revision.id, pageNumber, pageSize);
        if (!previewData) {
            throw new Error('No preview data found.');
        }
        pagination = generateSequenceForNumber(previewData.current_page, previewData.total_pages);
    } catch (err: any) {
        res.status(400);
        errors = [{ field: 'preview', message: { key: 'errors.preview.failed_to_get_preview' } }];
    }
    res.render('publish/cube-preview', { ...previewData, dataset, pagination, errors });
};

export const downloadAsCSV = async (req: Request, res: Response, next: NextFunction) => {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const revision = res.locals.revision;
    const fileStream = await req.swapi.getRevisionCubeCSV(dataset.id, revision.id);
    res.writeHead(200, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'text/csv; charset=utf-8',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-disposition': `attachment;filename=${revision.id}.csv`
    });
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
};

export const downloadAsParquet = async (req: Request, res: Response, next: NextFunction) => {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const revision = res.locals.revision;
    const fileStream = await req.swapi.getRevisionCubeParquet(dataset.id, revision.id);
    res.writeHead(200, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/vnd.apache.parquet',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-disposition': `attachment;filename=${revision.id}.parquet`
    });
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
};

export const downloadAsExcel = async (req: Request, res: Response, next: NextFunction) => {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const revision = res.locals.revision;
    const fileStream = await req.swapi.getRevisionCubeExcel(dataset.id, revision.id);
    res.writeHead(200, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/vnd.ms-excel',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-disposition': `attachment;filename=${revision.id}.xlsx`
    });
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
};

export const downloadAsDuckDb = async (req: Request, res: Response, next: NextFunction) => {
    const dataset = singleLangDataset(res.locals.dataset, req.language);
    const revision = res.locals.revision;
    const fileStream = await req.swapi.getRevisionCube(dataset.id, revision.id);
    res.writeHead(200, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/octet-stream',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-disposition': `attachment;filename=${revision.id}.duckdb`
    });
    const readable: Readable = Readable.from(fileStream);
    readable.pipe(res);
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

        if (req.method === 'POST') {
            logger.debug('User is uploading a measure lookup table..');
            try {
                if (!req.file) {
                    logger.error('No file is present in the request');
                    throw new Error('errors.csv.invalid');
                }
                const fileName = req.file.originalname;
                req.file.mimetype = fileMimeTypeHandler(req.file.mimetype, req.file.originalname);
                const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
                logger.debug('Sending file to backend.');
                await req.swapi.uploadMeasureLookup(dataset.id, fileData, fileName);
                res.redirect(req.buildUrl(`/publish/${dataset.id}/measure/review`, req.language));
                return;
            } catch (err) {
                const error = err as ApiException;
                logger.debug(`Error is: ${JSON.stringify(error, null, 2)}`);
                if (error.status === 400) {
                    logger.error('Measure lookup table did not match data in the fact table.', err);
                    const failurePreview = JSON.parse(error.body as string) as ViewErrDTO;
                    res.status(400);
                    res.render('publish/measure-match-failure', {
                        ...failurePreview,
                        measure
                    });
                    return;
                }
                logger.error('Something went wrong other than not matching');
                logger.debug(`Full error JSON: ${JSON.stringify(error, null, 2)}`);
                req.session.errors = [
                    {
                        field: 'unknown',
                        message: {
                            key: 'errors.csv.unknown'
                        }
                    }
                ];
                res.redirect(req.buildUrl(`/publish/${dataset.id}/measure`, req.language));
                return;
            }
        }

        const dataPreview = await req.swapi.getMeasurePreview(res.locals.dataset.id);
        if (req.session.errors) {
            const errors = req.session.errors;
            req.session.errors = undefined;
            req.session.save();
            res.status(500);
            res.render('publish/measure-preview', {
                ...dataPreview,
                measure,
                errors
            });
        } else {
            res.render('publish/measure-preview', { ...dataPreview, measure });
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
                case 'true':
                    res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
                    break;
                case 'goback':
                    try {
                        await req.swapi.resetMeasure(dataset.id);
                        res.redirect(req.buildUrl(`/publish/${dataset.id}/measure`, req.language));
                    } catch (err) {
                        const error = err as ApiException;
                        logger.error(
                            `Something went wrong trying to reset the dimension with the following error: ${err}`
                        );
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

        const dataPreview = await req.swapi.getMeasurePreview(res.locals.dataset.id);
        if (errors) {
            res.status(errors.status || 500);
            res.render('publish/measure-review', { ...dataPreview, measure, review: true, errors });
        } else {
            res.render('publish/measure-review', { ...dataPreview, measure, review: true });
        }
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

    if (req.method === 'POST') {
        logger.debug('User submitted a look up table');
        try {
            if (!req.file) {
                logger.error('No file attached to request');
                throw new Error('errors.csv.invalid');
            }
            const fileName = req.file.originalname;
            req.file.mimetype = fileMimeTypeHandler(req.file.mimetype, req.file.originalname);
            const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
            try {
                logger.debug('Sending lookup table to backend');
                await req.swapi.uploadLookupTable(dataset.id, dimension.id, fileData, fileName);
                res.redirect(req.buildUrl(`/publish/${dataset.id}/lookup/${dimension.id}/review`, req.language));
            } catch (err) {
                req.session.dimensionPatch = undefined;
                req.session.save();
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
                req.session.errors = [
                    {
                        field: 'unknown',
                        message: {
                            key: 'errors.csv.unknown'
                        }
                    }
                ];
                res.redirect(
                    req.buildUrl(`/publish/${dataset.id}/dimension-data-chooser/${dimension.id}/`, req.language)
                );
                return;
            }

            return;
        } catch (err) {
            res.status(400);
            errors = [{ field: 'csv', message: { key: 'errors.upload.no_csv_data' } }];
        }
    }

    res.render('publish/upload', { revisit, errors, uploadType: 'lookup' });
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

        if (req.method === 'POST') {
            switch (req.body.confirm) {
                case 'true':
                    res.redirect(req.buildUrl(`/publish/${dataset.id}/dimension/${dimension.id}/name`, req.language));
                    break;
                case 'goback':
                    try {
                        await req.swapi.resetDimension(dataset.id, dimension.id);
                        res.redirect(req.buildUrl(`/publish/${dataset.id}/lookup/${dimension.id}/`, req.language));
                    } catch (err) {
                        const error = err as ApiException;
                        logger.error(
                            `Something went wrong trying to reset the dimension with the following error: ${err}`
                        );
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

        const dataPreview = await req.swapi.getDimensionPreview(res.locals.dataset.id, dimension.id);
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

        if (req.method === 'POST') {
            switch (req.body.dimensionType) {
                case 'lookup':
                    req.session.dimensionPatch = {
                        dimension_type: DimensionType.LookupTable
                    };
                    res.redirect(req.buildUrl(`/publish/${dataset.id}/lookup/${dimension.id}`, req.language));
                    return;
                case 'age':
                case 'ethnicity':
                case 'geography':
                case 'religion':
                case 'sexGender':
                    req.session.dimensionPatch = {
                        dimension_type: DimensionType.ReferenceData,
                        reference_type: req.body.dimensionType
                    };
                    break;
            }
        }
        const dataPreview = await req.swapi.getDimensionPreview(res.locals.dataset.id, dimension.id);
        if (req.session.errors) {
            const errors = req.session.errors;
            req.session.errors = undefined;
            req.session.save();
            res.status(500);
            res.render('publish/dimension-data-chooser', {
                ...dataPreview,
                dimension,
                errors
            });
        } else {
            res.render('publish/dimension-chooser', { ...dataPreview, dimension });
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
            logger.error('Failed to find dimension in dataset');
            next(new NotFoundException());
            return;
        }

        if (req.method === 'POST') {
            switch (req.body.dimensionType) {
                case 'time_period':
                    res.redirect(
                        req.buildUrl(
                            `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/period-of-time`,
                            req.language
                        )
                    );
                    break;
                case 'time_point':
                    res.redirect(
                        req.buildUrl(
                            `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/point-in-time`,
                            req.language
                        )
                    );
                    break;
            }
            return;
        }

        const dataPreview = await req.swapi.getDimensionPreview(res.locals.dataset.id, dimension.id);
        res.render('publish/time-chooser', { ...dataPreview, dimension });
    } catch (err) {
        logger.error('Failed to get dimension preview', err);
        next(new NotFoundException());
    }
};

export const yearTypeChooser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dataset = singleLangDataset(res.locals.dataset, req.language);
        const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
        if (!dimension) {
            logger.error('Failed to find dimension in dataset');
            next(new NotFoundException());
            return;
        }

        if (req.method === 'POST') {
            if (req.body.yearType === 'calendar') {
                req.session.dimensionPatch = {
                    dimension_type: DimensionType.TimePeriod,
                    date_type: req.body.yearType,
                    year_format: 'YYYY'
                };
                req.session.save();
                res.redirect(
                    req.buildUrl(
                        `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/period-of-time/period-type`,
                        req.language
                    )
                );
                return;
            } else {
                req.session.dimensionPatch = {
                    dimension_type: DimensionType.TimePeriod,
                    date_type: req.body.yearType
                };
                req.session.save();
                res.redirect(
                    req.buildUrl(
                        `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/period-of-time/year-format`,
                        req.language
                    )
                );
                return;
            }
        }

        res.render('publish/year-type');
    } catch (err) {
        logger.error('Failed to get dimension preview', err);
        next(new NotFoundException());
    }
};

export const yearFormat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dimension = singleLangDataset(res.locals.dataset, req.language).dimensions?.find(
            (dim) => dim.id === req.params.dimensionId
        );
        if (!dimension) {
            logger.error('Failed to find dimension in dataset');
            next(new NotFoundException());
            return;
        }

        if (req.method === 'POST') {
            if (!req.session.dimensionPatch) {
                logger.error('Failed to find patch information in the session.');
                throw new Error('Year type not set in previous step');
            }
            req.session.dimensionPatch.year_format = req.body.yearType;
            req.session.save();
            res.redirect(
                req.buildUrl(
                    `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/period-of-time/period-type`,
                    req.language
                )
            );
            return;
        }

        res.render('publish/year-format');
    } catch (err) {
        logger.error('Failed to get dimension preview', err);
        next(new NotFoundException());
    }
};

export const periodType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dataset = singleLangDataset(res.locals.dataset, req.language);
        const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
        if (!dimension) {
            logger.error('Failed to find dimension in dataset');
            next(new NotFoundException());
            return;
        }

        const patchRequest = req.session.dimensionPatch;
        if (!patchRequest) {
            logger.error('Failed to find patch information in the session');
            req.buildUrl(
                `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/period-of-time/`,
                req.language
            );
            return;
        }

        if (req.method === 'POST') {
            switch (req.body.periodType) {
                case 'years':
                    try {
                        const previewData = await req.swapi.patchDimension(dataset.id, dimension.id, patchRequest);
                        logger.debug('Matching complete for year... Redirecting to review.');
                        res.redirect(
                            req.buildUrl(
                                `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/review`,
                                req.language
                            )
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
                            req.buildUrl(
                                `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/period-of-time/`,
                                req.language
                            )
                        );
                        return;
                    }
                case 'quarters':
                    res.redirect(
                        req.buildUrl(
                            `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/period-of-time/quarters`,
                            req.language
                        )
                    );
                    return;
                case 'months':
                    res.redirect(
                        req.buildUrl(
                            `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/period-of-time/months`,
                            req.language
                        )
                    );
                    return;
            }
        }
        res.render('publish/period-type');
    } catch (err) {
        logger.error('Failed to get dimension preview', err);
        next(new NotFoundException());
    }
};

export const quarterChooser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dataset = singleLangDataset(res.locals.dataset, req.language);
        const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
        if (!dimension) {
            logger.error('Failed to find dimension in dataset');
            next(new NotFoundException());
            return;
        }

        let quarterTotals = false;
        if (req.session.dimensionPatch?.month_format) {
            quarterTotals = true;
        }

        if (req.method === 'POST') {
            const patchRequest = req.session.dimensionPatch;
            if (!patchRequest) {
                res.redirect(`/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}`);
                return;
            }
            patchRequest.quarter_format = req.body.quarterType;
            if (req.body.fifthQuater === 'yes') {
                patchRequest.fifth_quarter = true;
            }
            try {
                const previewData = await req.swapi.patchDimension(dataset.id, dimension.id, patchRequest);
                // eslint-disable-next-line require-atomic-updates
                req.session.dimensionPatch = undefined;
                req.session.save();
                res.redirect(`/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/review`);
                return;
            } catch (err) {
                req.session.dimensionPatch = undefined;
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
                    req.buildUrl(
                        `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/period-of-time/`,
                        req.language
                    )
                );
                return;
            }
        }
        logger.debug(`Session dimensionPatch = ${JSON.stringify(req.session.dimensionPatch, null, 2)}`);
        res.render('publish/quarter-format', { quarterTotals });
    } catch (err) {
        logger.error('Failed to get dimension preview', err);
        next(new NotFoundException());
    }
};

export const monthChooser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dataset = singleLangDataset(res.locals.dataset, req.language);
        const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
        if (!dimension) {
            logger.error('Failed to find dimension in dataset');
            next(new NotFoundException());
            return;
        }

        if (req.method === 'POST') {
            const patchRequest = req.session.dimensionPatch;
            if (!patchRequest) {
                logger.error('Failed to find dimension in dataset in session');
                res.redirect(`/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}`);
                return;
            }
            patchRequest.month_format = req.body.monthFormat;
            req.session.dimensionPatch = patchRequest;
            logger.debug(
                `Saving Dimension Patch to session with the following: ${JSON.stringify(patchRequest, null, 2)}`
            );
            req.session.save();
            try {
                const previewData = await req.swapi.patchDimension(dataset.id, dimension.id, patchRequest);
                // eslint-disable-next-line require-atomic-updates
                req.session.dimensionPatch = undefined;
                req.session.save();
                res.redirect(`/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/review`);
                return;
            } catch (err) {
                logger.debug(`There were rows which didn't match.  Lets ask the user about quarterly totals.`);
                res.redirect(
                    `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/period-of-time/quarters`
                );
                return;
            }
        }
        const dataPreview = await req.swapi.getDimensionPreview(res.locals.dataset.id, dimension.id);
        res.render('publish/month-format', { ...dataPreview });
    } catch (err) {
        logger.error('Failed to get dimension preview', err);
        next(new NotFoundException());
    }
};

export const periodReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dataset = singleLangDataset(res.locals.dataset, req.language);
        const dimension = dataset.dimensions?.find((dim) => dim.id === req.params.dimensionId);
        if (!dimension) {
            logger.error('Failed to find dimension in dataset');
            next(new NotFoundException());
            return;
        }
        let errors: ViewErrDTO | undefined;

        if (req.method === 'POST') {
            switch (req.body.confirm) {
                case 'true':
                    res.redirect(
                        req.buildUrl(
                            `/publish/${req.params.datasetId}/dimension/${req.params.dimensionId}/name`,
                            req.language
                        )
                    );
                    break;
                case 'goback':
                    try {
                        await req.swapi.resetDimension(dataset.id, dimension.id);
                        res.redirect(
                            req.buildUrl(
                                `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/`,
                                req.language
                            )
                        );
                    } catch (err) {
                        const error = err as ApiException;
                        logger.error(
                            `Something went wrong trying to reset the dimension with the following error: ${err}`
                        );
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

        const dataPreview = await req.swapi.getDimensionPreview(res.locals.dataset.id, dimension.id);
        if (errors) {
            res.status(errors.status || 500);
            res.render('publish/time-chooser', { ...dataPreview, review: true, dimension, errors });
        } else {
            res.render('publish/time-chooser', { ...dataPreview, review: true, dimension });
        }
    } catch (err) {
        logger.error('Failed to get dimension preview', err);
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
        let errors: ViewErrDTO | undefined;
        const dimensionName = dimension.dimensionInfo?.name || '';
        if (req.method === 'POST') {
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
                res.render('publish/dimension-name', { ...{ updatedName }, errors });
                return;
            }
            if (updatedName.length > 256) {
                logger.error(`Dimension name is to long... Dimension name is ${req.body.name.length} characters long.`);
                errors = {
                    status: 400,
                    errors: [
                        {
                            field: 'name',
                            message: {
                                key: 'errors.dimension.name_to_long'
                            }
                        }
                    ],
                    dataset_id: req.params.datasetId
                };
                res.status(400);
                res.render('publish/dimension-name', { ...{ updatedName }, errors });
                return;
            } else if (updatedName.length < 1) {
                logger.error(`Dimension name is too short.`);
                errors = {
                    status: 400,
                    errors: [
                        {
                            field: 'name',
                            message: {
                                key: 'errors.dimension.name_to_short'
                            }
                        }
                    ],
                    dataset_id: req.params.datasetId
                };
                res.status(400);
                res.render('publish/dimension-name', { ...{ updatedName }, errors });
                return;
            } else if (!dimensionColumnNameRegex.test(updatedName)) {
                logger.error(`Dimension name contains characters which aren't allowed.`);
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
                res.render('publish/dimension-name', { ...{ updatedName }, errors });
                return;
            }
            const info: DimensionInfoDTO = {
                name: updatedName,
                language: req.language
            };
            try {
                await req.swapi.updateDimensionInfo(dataset.id, dimension.id, info);
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
                res.render('publish/dimension-name', { ...{ dimensionName }, errors });
                return;
            }
        }

        res.render('publish/dimension-name', { ...{ dimensionName } });
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
        const patchRequest: DimensionPatchDto = {
            date_format: req.body.dateFormat,
            dimension_type: DimensionType.TimePoint,
            date_type: YearType.PointInTime
        };
        try {
            const previewData = await req.swapi.patchDimension(dataset.id, dimension.id, patchRequest);
            logger.debug('Matching complete for specific point in time... Redirecting to review.');
            res.redirect(
                req.buildUrl(
                    `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/review`,
                    req.language
                )
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
                req.buildUrl(
                    `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/point-in-time/`,
                    req.language
                )
            );
            return;
        }
    }
    res.render('publish/point-in-time-chooser');
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
                        `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/point-in-time/years`,
                        req.language
                    )
                );
                return;
            case 'quarters':
                res.redirect(
                    req.buildUrl(
                        `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/point-in-time/quarters`,
                        req.language
                    )
                );
                return;
            case 'months':
                res.redirect(
                    req.buildUrl(
                        `/publish/${req.params.datasetId}/time-period/${req.params.dimensionId}/point-in-time/months`,
                        req.language
                    )
                );
        }
    }

    res.render('publish/period-of-time-type');
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
            res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
            return;
        }
    } catch (err) {
        if (err instanceof ApiException) {
            errors = [{ field: 'api', message: { key: 'publish.organisation.error.saving' } }];
        }
    }

    res.render('publish/organisation', { values, organisations, teams, errors });
};

export const exportTranslations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dataset = res.locals.dataset;

        if (req.query.format === 'csv') {
            const fileName = `translations-${dataset.id}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            const translationStream = await req.swapi.getTranslationExport(dataset.id);
            Readable.from(translationStream).pipe(res);
            return;
        }

        let translations = await req.swapi.getTranslationPreview(dataset.id);
        translations = addEditLinks(translations, dataset.id, req);
        res.render('publish/translations/export', { translations });
    } catch (err) {
        next(new UnknownException());
    }
};

const parseUploadedTranslations = async (fileBuffer: Buffer): Promise<TranslationDTO[]> => {
    const translations: TranslationDTO[] = [];

    const csvParser: AsyncIterable<TranslationDTO> = Readable.from(fileBuffer).pipe(
        parse({ bom: true, columns: true })
    );

    for await (const row of csvParser) {
        translations.push(row);
    }

    return translations;
};

export const importTranslations = async (req: Request, res: Response, next: NextFunction) => {
    const dataset = res.locals.dataset;
    let errors: ViewError[] = [];
    let preview = false;
    let translations: TranslationDTO[] = [];

    try {
        if (req.query.confirm === 'true') {
            await req.swapi.updateTranslations(dataset.id);
            res.redirect(req.buildUrl(`/publish/${dataset.id}/tasklist`, req.language));
            return;
        }

        if (req.method === 'POST') {
            if (!req.file) {
                errors = [{ field: 'csv', message: { key: 'translations.import.form.file.error.missing' } }];
                throw new Error();
            }

            const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
            await req.swapi.uploadTranslationImport(dataset.id, fileData);

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

    res.render('publish/translations/import', { preview, translations, errors });
};
