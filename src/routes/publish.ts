import { Blob } from 'node:buffer';

import { NextFunction, Response, Router } from 'express';
import multer from 'multer';
import { validate as validateUUID } from 'uuid';

import { logger } from '../utils/logger';
import { StatsWalesApi } from '../services/stats-wales-api';
import { ViewDTO, ViewErrDTO } from '../dtos/view-dto';
import { i18next } from '../middleware/translation';
import { AuthedRequest } from '../interfaces/authed-request';
import { DatasetDTO, DatasetInfoDTO, FileImportDTO, RevisionDTO } from '../dtos/dataset-dto';
import { DimensionCreationDTO } from '../dtos/dimension-creation-dto';
import { SourceType } from '../enums/source-type';
import { ViewError } from '../dtos/view-error';
import { singleLangDataset } from '../utils/single-lang-dataset';
import { DimensionType } from '../enums/dimension-type';
import { DimensionState } from '../dtos/dimension-state';
import { TaskListState } from '../dtos/task-list-state';
import { SingleLanguageDataset } from '../dtos/single-language/dataset';
import { Locale } from '../enums/locale';
import { generateViewErrors } from '../utils/generate-view-errors';

const t = i18next.t;
const upload = multer({ storage: multer.memoryStorage() });

export const publish = Router();

// Functions to reduce duplicate code
function setCurrentToSession(dataset: DatasetDTO, req: AuthedRequest): boolean {
    req.session.currentDataset = dataset;
    if (!dataset.revisions) {
        return false;
    }
    const currentRevision = dataset.revisions.reduce((prev, curr) => {
        return new Date(prev.created_at) > new Date(curr.created_at) ? prev : curr;
    });
    req.session.currentRevision = currentRevision;
    if (!currentRevision.imports) {
        return false;
    }
    req.session.currentImport = currentRevision.imports.reduce((prev, curr) => {
        return new Date(prev.uploaded_at) > new Date(curr.uploaded_at) ? prev : curr;
    });
    req.session.save();
    return true;
}

function generateFileError(req: AuthedRequest, res: Response) {
    logger.debug('Attached file was missing on this request');
    const err: ViewErrDTO = {
        success: false,
        status: 400,
        dataset_id: undefined,
        errors: [
            {
                field: 'csv',
                tag: {
                    name: 'errors.upload.no_csv_data',
                    params: {}
                }
            }
        ]
    };
    res.status(400);
    res.render('publish/upload', { errors: err });
}

function generateError(field: string, tag: string, params: object): ViewError {
    return {
        field,
        tag: {
            name: tag,
            params
        }
    };
}

function checkCurrentDataset(req: AuthedRequest, res: Response): DatasetDTO | undefined {
    const lang = req.i18n.language;
    const currentDataset = req.session.currentDataset;
    if (!currentDataset) {
        logger.error('No current dataset found in the session... user may have navigated here by mistake');
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.session.current_dataset_missing', {})
        ]);
        res.redirect(`/${lang}/${req.i18n.t('routes.publish.start', { lng: lang })}`);
        return undefined;
    }
    return currentDataset;
}

function checkCurrentRevision(req: AuthedRequest, res: Response): RevisionDTO | undefined {
    const lang = req.i18n.language;
    const currentRevision = req.session.currentRevision;
    if (!currentRevision) {
        logger.error('No current revision found in the session... user may have navigated here by mistake');
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.session.current_revision_missing', {})
        ]);
        res.redirect(`/${lang}/${req.i18n.t('routes.publish.start', { lng: lang })}`);
        return undefined;
    }
    return currentRevision;
}

function checkCurrentFileImport(req: AuthedRequest, res: Response): FileImportDTO | undefined {
    const lang = req.i18n.language;
    const currentFileImport = req.session.currentImport;
    if (!currentFileImport) {
        logger.error('No current import found in the session... user may have navigated here by mistake');
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.session.current_import_missing', {})
        ]);
        res.redirect(`/${lang}/${req.i18n.t('routes.publish.start', { lng: lang })}`);
        return undefined;
    }
    return currentFileImport;
}

async function createNewDataset(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
    const lng = req.language as Locale;
    const statsWalesApi = new StatsWalesApi(lng, req.jwt);
    const title = req.session.currentTitle;
    const file = req.file;

    if (!title) {
        logger.debug('Current title missing from the session');
        req.session.errors = generateViewErrors(undefined, 400, [generateError('title', 'errors.title_missing', {})]);
        res.redirect(`/${lng}/${req.i18n.t('routes.publish.start', { lng })}/${t('routes.publish.title', { lng })}`);
        return;
    }

    if (!file) {
        generateFileError(req, res);
        return;
    }

    const fileName = file.originalname;
    const fileData = new Blob([file.buffer], { type: file.mimetype });

    try {
        const dataset = await statsWalesApi.uploadCSVtoCreateDataset(fileData, fileName, title);
        setCurrentToSession(dataset, req);
        res.redirect(
            `/${lng}/${req.i18n.t('routes.publish.start', { lng })}/${req.i18n.t('routes.publish.preview', { lng })}`
        );
    } catch (err: any) {
        if (err?.status === 401) {
            next(err);
            return;
        }
        req.session.errors = generateViewErrors(undefined, 500, err?.errors);
        res.redirect(`/${lng}/${req.i18n.t('routes.publish.start', { lng })}`);
    }
}

async function uploadNewFileToExistingDataset(req: AuthedRequest, res: Response, next: NextFunction) {
    const lng = req.language as Locale;
    const statsWalesApi = new StatsWalesApi(lng, req.jwt);
    const currentDataset = checkCurrentDataset(req, res);
    const currentRevision = checkCurrentRevision(req, res);

    if (!currentDataset || !currentRevision) {
        return;
    }

    if (!req.file) {
        generateFileError(req, res);
        return;
    }

    const fileName = req.file.originalname;
    const fileData = new Blob([req.file.buffer], { type: req.file.mimetype });

    try {
        const dataset = await statsWalesApi.uploadCSVToFixDataset(
            currentDataset.id,
            currentRevision.id,
            fileData,
            fileName
        );
        setCurrentToSession(dataset, req);
        res.redirect(
            `/${lng}/${req.i18n.t('routes.publish.start', { lng })}/${req.i18n.t('routes.publish.preview', { lng })}`
        );
    } catch (err: any) {
        if (err?.status === 401) {
            next(err);
            return;
        }
        req.session.errors = generateViewErrors(undefined, 500, err?.errors);
        res.redirect(`/${lng}/${req.i18n.t('routes.publish.start', { lng })}`);
    }
}

function cleanupSession(req: AuthedRequest) {
    req.session.currentDataset = undefined;
    req.session.currentRevision = undefined;
    req.session.currentImport = undefined;
    req.session.dimensionCreationRequest = undefined;
    req.session.errors = undefined;
    req.session.save();
}

publish.get('/', (req: AuthedRequest, res: Response) => {
    const errors = req.session.errors;
    // This is the start, there are a number of reason we can end up here
    // from errors in a previous attempt to just starting a new dataset.
    // So lets clean up any remaining session data.
    cleanupSession(req);
    res.render('publish/start', { errors });
});

publish.get('/title', (req: AuthedRequest, res: Response) => {
    res.render('publish/title', {
        errors: req.session.errors,
        isMetadata: false,
        currrentTitle: req.session.currentTitle,
        postAction: `/${req.language}/${t('routes.publish.start')}/${t('routes.publish.title')}`,
        backButtonLink: `/${req.language}/${t('routes.publish.start')}/`
    });
});

publish.post('/title', upload.none(), (req: AuthedRequest, res: Response) => {
    if (!req.body?.title) {
        logger.error('The user failed to supply a title in the request');
        res.status(400);
        res.render('publish/title', {
            errors: generateViewErrors(undefined, 500, [generateError('title', 'errors.title.missing', {})]),
            isMetadata: false,
            currrentTitle: req.session.currentTitle,
            postAction: `/${req.language}/${t('routes.publish.start')}/${t('routes.publish.title')}`,
            backButtonLink: `/${req.language}/${t('routes.publish.start')}/`
        });
        return;
    }
    req.session.currentTitle = req.body.title;
    req.session.save();
    const lang = req.i18n.language;
    res.redirect(
        `/${lang}/${req.i18n.t('routes.publish.start', { lng: lang })}/${req.i18n.t('routes.publish.upload', { lng: lang })}`
    );
});

publish.get('/upload', (req: AuthedRequest, res: Response) => {
    const currentTitle = req.session.currentTitle;
    const currentDataset = req.session.currentDataset;
    if (!currentDataset && !currentTitle) {
        logger.error('There is no title or currentDataset in the session.  Abandoning this create journey');
        req.session.errors = generateViewErrors(undefined, 500, [generateError('title', 'errors.title.missing', {})]);
        req.session.save();
        const lang = req.i18n.language;
        res.redirect(
            `/${lang}/${req.i18n.t('routes.publish.start', { lng: lang })}/${t('routes.publish.title', { lng: lang })}`
        );
        return;
    }
    const title = currentDataset?.datasetInfo?.find((info) => info.language === req.i18n.language) || currentTitle;
    res.render('publish/upload', { title });
});

publish.post('/upload', upload.single('csv'), async (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (req.session.currentDataset) {
        logger.info('Dataset present... Amending existing Dataset');
        await uploadNewFileToExistingDataset(req, res, next);
    } else {
        logger.info('Creating a new dataset');
        await createNewDataset(req, res, next);
    }
});

publish.get('/preview', async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const lng = req.language as Locale;
    const statsWalesApi = new StatsWalesApi(lng, req.jwt);

    const currentDataset = checkCurrentDataset(req, res);
    if (!currentDataset) {
        return;
    }

    const currentRevision = checkCurrentRevision(req, res);
    if (!currentRevision) {
        return;
    }

    const currentFileImport = checkCurrentFileImport(req, res);
    if (!currentFileImport) {
        return;
    }

    const page_number: number = Number.parseInt(req.query.page_number as string, 10) || 1;
    const page_size: number = Number.parseInt(req.query.page_size as string, 10) || 10;

    try {
        const previewData: ViewDTO = await statsWalesApi.getDatasetDatafilePreview(
            currentDataset.id,
            currentRevision.id,
            currentFileImport.id,
            page_number,
            page_size
        );
        res.render('publish/preview', previewData);
    } catch (err: any) {
        if (err?.status === 401) {
            next(err);
            return;
        }
        logger.error('Failed to get preview data from the backend');
        // eslint-disable-next-line require-atomic-updates
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('preview', 'errors.preview.failed_to_get_preview', {})
        ]);
        req.session.save();
        res.redirect(`/${lng}/${req.i18n.t('routes.publish.start', { lng })}`);
    }
});

async function confirmFileUpload(
    currentDataset: DatasetDTO,
    currentRevision: RevisionDTO,
    currentFileImport: FileImportDTO,
    statsWalesApi: StatsWalesApi,
    req: AuthedRequest,
    res: Response,
    next: NextFunction
) {
    const lng = req.language;
    try {
        const fileImport: FileImportDTO = await statsWalesApi.confirmFileImport(
            currentDataset.id,
            currentRevision.id,
            currentFileImport.id
        );
        // eslint-disable-next-line require-atomic-updates
        req.session.currentImport = fileImport;
        req.session.save();
        res.redirect(
            `/${lng}/${req.i18n.t('routes.publish.start', { lng })}/${req.i18n.t('routes.publish.sources', { lng })}`
        );
    } catch (err: any) {
        if (err?.status === 401) {
            next(err);
            return;
        }
        logger.error(
            `An HTTP error occurred trying to confirm import from the dataset with the following error: ${err}`
        );
        // eslint-disable-next-line require-atomic-updates
        req.session.errors = generateViewErrors(currentDataset.id, 500, [
            generateError('confirm', 'errors.preview.confirm_error', {})
        ]);
        req.session.save();
        res.redirect(
            `/${lng}/${req.i18n.t('routes.publish.start', { lng })}/${req.i18n.t('routes.publish.preview', { lng })}`
        );
    }
}

async function rejectFileReturnToUpload(
    currentDataset: DatasetDTO,
    currentRevision: RevisionDTO,
    currentFileImport: FileImportDTO,
    statsWalesApi: StatsWalesApi,
    req: AuthedRequest,
    res: Response,
    next: NextFunction
) {
    const lang = req.i18n.language;
    try {
        req.session.currentImport = undefined;
        await statsWalesApi.removeFileImport(currentDataset.id, currentRevision.id, currentFileImport.id);
        req.session.save();
        res.redirect(
            `/${lang}/${req.i18n.t('routes.publish.start', { lng: lang })}/${req.i18n.t('routes.publish.upload')}`
        );
    } catch (err: any) {
        if (err?.status === 401) {
            next(err);
            return;
        }
        logger.error(
            `An HTTP error occurred trying to remove the import from the dataset with the following error: ${err}`
        );
        req.session.errors = generateViewErrors(currentDataset.id, 500, [
            generateError('confirm', 'errors.preview.remove_error', {})
        ]);
        req.session.save();
        res.redirect(
            `/${lang}/${req.i18n.t('routes.publish.start', { lng: lang })}/${req.i18n.t('routes.publish.preview', { lng: lang })}`
        );
    }
}

publish.post('/preview', upload.none(), async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const currentDataset = checkCurrentDataset(req, res);
    if (!currentDataset) {
        return;
    }

    const currentRevision = checkCurrentRevision(req, res);
    if (!currentRevision) {
        return;
    }

    const currentFileImport = checkCurrentFileImport(req, res);
    if (!currentFileImport) {
        return;
    }

    const lng = req.language as Locale;
    const confirmData = req.body?.confirm;
    if (!confirmData) {
        logger.error('The confirm variable is missing on the form submission');
        req.session.errors = generateViewErrors(undefined, 400, [
            generateError('confirmBtn', 'errors.confirm.missing', {})
        ]);
        req.session.save();
        res.redirect(
            `/${lng}/${req.i18n.t('routes.publish.start', { lng })}/${req.i18n.t('routes.publish.preview', { lng })}`
        );
        return;
    }
    const statsWalesApi = new StatsWalesApi(lng, req.jwt);
    if (confirmData === 'true') {
        logger.info('User confirmed file upload was correct');
        await confirmFileUpload(currentDataset, currentRevision, currentFileImport, statsWalesApi, req, res, next);
    } else {
        logger.info('User rejected the file in preview');
        await rejectFileReturnToUpload(
            currentDataset,
            currentRevision,
            currentFileImport,
            statsWalesApi,
            req,
            res,
            next
        );
    }
});

function updateCurrentImport(currentImport: FileImportDTO, dimensionCreationRequest: DimensionCreationDTO[]) {
    if (currentImport.sources) {
        currentImport.sources.forEach((source) => {
            source.type =
                dimensionCreationRequest.find((dim) => dim.sourceId === source.id)?.sourceType || SourceType.Unknown;
        });
    }
    return currentImport;
}

publish.get('/sources', upload.none(), (req: AuthedRequest, res: Response) => {
    const lang = req.i18n.language;
    let currentFileImport = checkCurrentFileImport(req, res);
    const dimensionCreationRequest = req.session.dimensionCreationRequest;
    if (!currentFileImport) {
        return;
    }
    if (currentFileImport.sources.length === 0) {
        logger.error('No current import found in the session with sources... user may have navigated here by mistake');
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.session.no_sources_on_import', {})
        ]);
        req.session.save();
        res.redirect(`/${lang}/${req.i18n.t('routes.publish.start', { lng: lang })}`);
        return;
    }
    const errs = req.session.errors;
    req.session.errors = undefined;
    req.session.save();
    if (errs) {
        res.status(500);
    } else {
        res.status(200);
    }

    if (dimensionCreationRequest) {
        currentFileImport = updateCurrentImport(currentFileImport, dimensionCreationRequest);
    } else {
        currentFileImport.sources.forEach((source) => {
            source.type = SourceType.Unknown;
        });
    }
    res.render('publish/sources', {
        errors: errs,
        currentImport: currentFileImport,
        sourceTypes: Object.values(SourceType)
    });
});

publish.post('/sources', upload.none(), async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const lng = req.language as Locale;
    const currentDataset = checkCurrentDataset(req, res);
    if (!currentDataset) {
        return;
    }

    const currentRevision = checkCurrentRevision(req, res);
    if (!currentRevision) {
        return;
    }

    const currentFileImport = checkCurrentFileImport(req, res);
    if (!currentFileImport) {
        return;
    }

    if (currentFileImport.sources.length === 0) {
        logger.error('No current import found in the session... user may have navigated here by mistake');
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.session.no_sources_on_import', {})
        ]);
        req.session.save();
        res.redirect(`/${lng}/${req.i18n.t('routes.publish.start', { lng })}`);
        return;
    }

    logger.info('Creating Dimension Request object');
    const dimensionCreationRequest: DimensionCreationDTO[] = currentFileImport.sources.map((source) => {
        return {
            sourceId: source.id,
            sourceType: req.body[source.id]
        };
    });
    req.session.dimensionCreationRequest = dimensionCreationRequest;
    req.session.save();
    const updatedFileImportWithSourceType = updateCurrentImport(currentFileImport, dimensionCreationRequest);
    logger.info(
        `Validating the request before sending to the server, dimensionCreationRequest length = ${dimensionCreationRequest.length}`
    );
    const sourcesMarkedUnknown = dimensionCreationRequest.filter(
        (createRequest) => createRequest.sourceType === SourceType.Unknown
    );
    const sourcesMarkedDataValues = dimensionCreationRequest.filter(
        (createRequest) => createRequest.sourceType === SourceType.DataValues
    );
    const sourcesMarkedFootnotes = dimensionCreationRequest.filter(
        (createRequest) => createRequest.sourceType === SourceType.FootNotes
    );

    if (sourcesMarkedUnknown.length > 0) {
        logger.error('User failed to identify all sources');
        const errs = generateViewErrors(undefined, 400, [
            generateError('session', 'errors.sources.unknowns_found', {})
        ]);
        req.session.errors = errs;
        req.session.save();
        res.status(400);
        res.render('publish/sources', {
            errors: errs,
            currentImport: updatedFileImportWithSourceType,
            sourceTypes: Object.values(SourceType)
        });
        return;
    }

    if (sourcesMarkedDataValues.length > 1) {
        logger.error('User tried to specify multiple data value sources');
        const errs = generateViewErrors(undefined, 400, [
            generateError('session', 'errors.sources.multiple_datavalues', {})
        ]);
        req.session.errors = errs;
        req.session.dimensionCreationRequest = dimensionCreationRequest;
        req.session.save();
        res.status(400);
        res.render('publish/sources', {
            errors: errs,
            currentImport: updatedFileImportWithSourceType,
            sourceTypes: Object.values(SourceType)
        });
        return;
    }

    if (sourcesMarkedFootnotes.length > 1) {
        logger.error('User tried to specify multiple footnote sources');
        const errs = generateViewErrors(undefined, 400, [
            generateError('session', 'errors.sources.multiple_footnotes', {})
        ]);
        req.session.errors = errs;
        req.session.save();
        res.status(400);
        res.render('publish/sources', {
            errors: errs,
            currentImport: updatedFileImportWithSourceType,
            sourceTypes: Object.values(SourceType)
        });
        return;
    }

    logger.info('Dimension creation request checks out... Sending it to the backend to do its thing');
    const statsWalesApi = new StatsWalesApi(lng, req.jwt);

    try {
        const dataset: DatasetDTO = await statsWalesApi.sendCreateDimensionRequest(
            currentDataset.id,
            currentRevision.id,
            currentFileImport.id,
            dimensionCreationRequest
        );

        res.redirect(
            `/${lng}/${req.i18n.t('routes.publish.start', { lng })}/${dataset.id}/${req.i18n.t('routes.publish.tasklist', { lng })}`
        );
    } catch (err: any) {
        if (err?.status === 401) {
            next(err);
            return;
        }
        logger.error(`Something went wrong with the Dimension Creation Request with the following error: ${err}`);
        const errs = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.sources.dimension_creation_failed', {})
        ]);
        req.session.save();
        res.status(500);
        res.render('publish/sources', {
            errors: errs,
            currentImport: updatedFileImportWithSourceType,
            sourceTypes: Object.values(SourceType)
        });
    }
});

// As discussed we'll move this to the backend  in a future PR and have a route which returns this
function buildStateFromDataset(lang: string, dataset: DatasetDTO): TaskListState {
    const singleLanguageDataset = singleLangDataset(lang, dataset);
    const datasetTitle = singleLanguageDataset.datasetInfo?.title || t('publish.tasklist.no_title', { lng: lang });
    const titleState = singleLanguageDataset.datasetInfo?.title
        ? { tag: 'publish.tasklist.status.completed', colour: 'green' }
        : { tag: 'publish.tasklist.status.not_started', colour: 'blue' };
    const dimensionStates: DimensionState[] = [];
    const dimensions = singleLanguageDataset.dimensions || [];
    for (const dim of dimensions) {
        if (dim.type === DimensionType.FootNote) {
            continue;
        }
        const dimState =
            dim.type === DimensionType.Raw
                ? { tag: 'publish.tasklist.status.not_implemented', colour: 'grey' }
                : { tag: 'publish.tasklist.status.completed', colour: 'green' };
        const name = dim.dimensionInfo?.name || 'unknown';
        dimensionStates.push({
            name,
            state: dimState
        });
    }
    const notImplemented = { tag: 'publish.tasklist.status.not_implemented', colour: 'grey' };
    return {
        datasetTitle,
        datasetId: dataset.id,
        dimensions: dimensionStates,
        metadata: {
            title: titleState,
            summary: notImplemented,
            statistical_quality: notImplemented,
            data_sources: notImplemented,
            related_reports: notImplemented,
            update_frequency: notImplemented,
            designation: notImplemented,
            data_collection: notImplemented,
            relevant_topics: notImplemented
        },
        publishing: {
            when: notImplemented,
            export: notImplemented,
            import: notImplemented,
            submit: notImplemented
        }
    };
}

publish.get('/:datasetId/tasklist', async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const lng = req.language as Locale;
    const datasetId = req.params.datasetId as string;
    const statsWalesApi = new StatsWalesApi(lng, req.jwt);

    try {
        if (!validateUUID(datasetId)) throw new Error('Invalid dataset ID');
        const dataset = await statsWalesApi.getDataset(datasetId);
        setCurrentToSession(dataset, req);
        res.render('publish/tasklist', {
            taskList: buildStateFromDataset(lng, dataset),
            sourcesUrl: `/${lng}/${req.i18n.t('routes.publish.start', { lng })}/${req.i18n.t('routes.publish.sources', { lng })}`
        });
    } catch (err: any) {
        if (err?.status === 401) {
            next(err);
            return;
        }
        logger.error(`Something went wrong viewing the tasklist: ${err}`);
        res.status(404);
        res.render('errors/not-found');
    }
});

publish.get('/:datasetId/title', async (req: AuthedRequest, res: Response) => {
    const lang = req.language as Locale;
    const datasetId = req.params.datasetId as string;
    const statsWalesApi = new StatsWalesApi(lang, req.jwt);

    try {
        if (!validateUUID(datasetId)) throw new Error('Invalid dataset ID');
        const dataset = await statsWalesApi.getDataset(datasetId);
        setCurrentToSession(dataset, req);
        const singleLanguageDataset = singleLangDataset(lang, dataset);

        res.render('publish/title', {
            errors: req.session.errors,
            currentTitle: singleLanguageDataset.datasetInfo?.title,
            isMetadata: true,
            datasetId,
            postAction: `/${req.language}/${t('routes.publish.start')}/${datasetId}/${t('routes.publish.title')}`,
            backButtonLink: `/${req.language}/${t('routes.publish.start')}/${datasetId}/${t('routes.publish.tasklist')}`
        });
    } catch (err) {
        logger.error(`Something went wrong trying to load the title: ${err}`);
        res.status(404);
        res.render('errors/not-found');
    }
});

publish.post('/:datasetId/title', upload.none(), async (req: AuthedRequest, res: Response) => {
    const lng = req.language as Locale;
    const datasetId = req.params.datasetId as string;
    const statsWalesApi = new StatsWalesApi(lng, req.jwt);
    try {
        if (!validateUUID(datasetId)) throw new Error('Invalid dataset ID');
        const dataset = await statsWalesApi.getDataset(datasetId);
        setCurrentToSession(dataset, req);
        const singleLanguageDataset = singleLangDataset(lng, dataset);
        if (!req.body?.title) {
            logger.error('The user failed to supply a title in the request');
            res.status(400);
            res.render('publish/title', {
                errors: generateViewErrors(undefined, 500, [generateError('title', 'errors.title.missing', {})]),
                currentTitle: singleLanguageDataset.datasetInfo?.title,
                isMetadata: true,
                datasetId,
                postAction: `/${req.language}/${t('routes.publish.start')}/${datasetId}/${t('routes.publish.title')}`,
                backButtonLink: `/${req.language}/${t('routes.publish.start')}/${datasetId}/${t('routes.publish.tasklist')}`
            });
            return;
        }
        const infoDto: DatasetInfoDTO = singleLanguageDataset.datasetInfo || ({ language: lng } as DatasetInfoDTO);
        infoDto.title = req.body.title;
        await statsWalesApi.sendDatasetInfo(datasetId, infoDto);
        res.redirect(
            `/${lng}/${req.i18n.t('routes.publish.start', { lng })}/${dataset.id}/${req.i18n.t('routes.publish.tasklist', { lng })}`
        );
    } catch (err) {
        logger.error(`Something went wrong trying to load the title: ${err}`);
        res.status(404);
        res.render('errors/not-found');
    }
});

// The following routes are mostly for testing and development purposes
publish.get('/session/', (req: AuthedRequest, res: Response) => {
    res.status(200);
    res.header('mime-type', 'application/json');
    res.json({
        session: req.session,
        user: req.user
    });
});

publish.delete('/session/', (req: AuthedRequest, res: Response) => {
    cleanupSession(req);
    res.status(200);
    res.json({ message: 'All session data has been cleared' });
});

publish.delete('/session/currentRevision', (req: AuthedRequest, res: Response) => {
    req.session.currentRevision = undefined;
    req.session.save();
    res.status(200);
    res.json({ message: 'Current revision has been deleted' });
});

publish.delete('/session/currentImport', (req: AuthedRequest, res: Response) => {
    req.session.currentImport = undefined;
    req.session.save();
    res.status(200);
    res.json({ message: 'Current import has been deleted' });
});
