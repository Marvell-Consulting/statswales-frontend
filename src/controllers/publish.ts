import { Request, Response, NextFunction } from 'express';

import { generateViewErrors } from '../utils/generate-view-errors';
import { hasError, titleValidator } from '../validators';
import { ViewError } from '../dtos/view-error';
import { logger } from '../utils/logger';
import { ViewDTO, ViewErrDTO } from '../dtos/view-dto';
import { SourceType } from '../enums/source-type';
import { SourceDTO } from '../dtos/source';
import { SourceAssignmentDTO } from '../dtos/source-assignment-dto';
import { UnknownException } from '../exceptions/unknown.exception';
import { TaskListState } from '../dtos/task-list-state';
import { NotFoundException } from '../exceptions/not-found.exception';
import { statusToColour } from '../utils/status-to-colour';
import { singleLangDataset } from '../utils/single-lang-dataset';
import { updateSourceTypes } from '../utils/update-source-types';

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
            if (!req.file || req.file.mimetype !== 'text/csv') {
                throw new Error('errors.csv.invalid');
            }
            logger.debug('File upload submitted...');
            const fileName = req.file.originalname;
            const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
            await req.swapi.uploadCSVToDataset(dataset.id, fileData, fileName);
            res.redirect(req.buildUrl(`/publish/${dataset.id}/preview`, req.language));
            return;
        } catch (err) {
            const error: ViewError = { field: 'csv', tag: { name: 'errors.upload.no_csv_data' } };
            errors = generateViewErrors(undefined, 400, [error]);
        }
    }

    res.render('publish/upload', { revisit, errors });
};

export const importPreview = async (req: Request, res: Response, next: NextFunction) => {
    const { dataset, revision, fileImport } = res.locals;
    const revisit = dataset.dimensions?.length > 0;
    let errors: ViewErrDTO | undefined;
    let previewData: ViewDTO | undefined;
    let ignoredCount = 0;

    try {
        if (!dataset || !revision || !fileImport) {
            logger.error('Import not found');
            throw new Error('errors.preview.import_missing');
        }

        const pageNumber = Number.parseInt(req.query.page_number as string, 10) || 1;
        const pageSize = Number.parseInt(req.query.page_size as string, 10) || 10;
        previewData = await req.swapi.getImportPreview(dataset.id, revision.id, fileImport.id, pageNumber, pageSize);
        ignoredCount = previewData.headers.filter((header) => header.source_type === SourceType.Ignore).length;
    } catch (err: any) {
        const error: ViewError = { field: 'preview', tag: { name: 'errors.preview.failed_to_get_preview' } };
        errors = generateViewErrors(undefined, 400, [error]);
    }

    res.render('publish/preview', { ...previewData, ignoredCount, revisit, errors });
};

export const confirm = async (req: Request, res: Response, next: NextFunction) => {
    const { dataset, revision, fileImport } = res.locals;

    try {
        if (!dataset || !revision || !fileImport) {
            logger.error('Import not found');
            throw new Error('errors.preview.import_missing');
        }

        await req.swapi.confirmFileImport(dataset.id, revision.id, fileImport.id);
        res.redirect(req.buildUrl(`/publish/${dataset.id}/sources`, req.language));
    } catch (err: any) {
        const error: ViewError = { field: 'confirm', tag: { name: 'errors.preview.confirm_error' } };
        req.session.errors = generateViewErrors(dataset.id, 500, [error]);
        req.session.save();
        res.redirect(req.buildUrl(`/publish/${dataset.id}/preview`, req.language));
    }
};

export const sources = async (req: Request, res: Response, next: NextFunction) => {
    const { dataset, revision, fileImport } = res.locals;
    const revisit = dataset.dimensions?.length > 0;
    let error: ViewError | undefined;
    let errors: ViewErrDTO | undefined;
    let currentImport = fileImport;

    try {
        if (!dataset || !revision || !fileImport) {
            logger.error('Import not found');
            throw new Error('errors.preview.import_missing');
        }

        if (req.method === 'POST') {
            const counts = { unknown: 0, dataValues: 0, footnotes: 0 };

            const sourceAssignment: SourceAssignmentDTO[] = fileImport.sources.map((source: SourceDTO) => {
                const sourceType = req.body[source.id];
                if (sourceType === SourceType.Unknown) counts.unknown++;
                if (sourceType === SourceType.DataValues) counts.dataValues++;
                if (sourceType === SourceType.FootNotes) counts.footnotes++;
                return { sourceId: source.id, sourceType };
            });

            currentImport = updateSourceTypes(fileImport, sourceAssignment);

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

            if (error) {
                errors = generateViewErrors(undefined, 400, [error]);
                res.status(400);
            } else {
                await req.swapi.assignSources(dataset.id, revision.id, fileImport.id, sourceAssignment);
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