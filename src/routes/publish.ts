import { Blob } from 'buffer';

import { Request, Response, Router } from 'express';
import multer from 'multer';

import { logger } from '../utils/logger';
import { StatsWalesApi } from '../services/stats-wales-api';
import { ViewDTO, ViewErrDTO } from '../dtos2/view-dto';
import { i18next } from '../middleware/translation';
import { AuthedRequest } from '../interfaces/authed-request';
import { DatasetDTO, ImportDTO, RevisionDTO } from '../dtos2/dataset-dto';
import { UploadDTO, UploadErrDTO } from '../dtos2/upload-dto';
import { ConfirmedImportDTO } from '../dtos2/confirmed-import-dto';
import { DimensionCreationDTO } from '../dtos2/dimension-creation-dto';
import { SourceType } from '../enums/source-type';
import { ViewError } from '../dtos2/view-error';

const t = i18next.t;
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const publish = Router();

// Functions to reduce duplicate code
function setCurrentToSession(dataset: DatasetDTO, req: AuthedRequest): boolean {
    req.session.currentDataset = dataset;
    if (!dataset.revisions) {
        return false;
    }
    const currentRevision = dataset.revisions.reduce((prev, curr) => {
        return new Date(prev.creation_date) > new Date(curr.creation_date) ? prev : curr;
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
                    name: 'errors.upload.no-csv-data',
                    params: {}
                }
            }
        ]
    };
    res.status(400);
    res.render('publish/upload', err);
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

function generateViewErrors(datasetID: string | undefined, statusCode: number, errors: ViewError[]): ViewErrDTO {
    return {
        success: false,
        status: statusCode,
        errors,
        dataset_id: datasetID
    } as ViewErrDTO;
}

function checkCurrentDataset(req: AuthedRequest, res: Response): DatasetDTO | undefined {
    const currentDataset = req.session.currentDataset;
    if (!currentDataset) {
        logger.error('No current dataset found in the session... user may have navigated here by mistake');
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.session.current_dataset_missing', {})
        ]);
        res.redirect(`/${req.i18n.language}/${req.t('routes.publish.start')}/`);
        return undefined;
    }
    return currentDataset;
}

function checkCurrentRevision(req: AuthedRequest, res: Response): RevisionDTO | undefined {
    const currentRevision = req.session.currentRevision;
    if (!currentRevision) {
        logger.error('No current revision found in the session... user may have navigated here by mistake');
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.session.current_revision_missing', {})
        ]);
        res.redirect(`/${req.i18n.language}/${req.t('routes.publish.start')}/`);
        return undefined;
    }
    return currentRevision;
}

function checkCurrentFileImport(req: AuthedRequest, res: Response): ImportDTO | undefined {
    const currentFileImport = req.session.currentImport;
    if (!currentFileImport) {
        logger.error('No current import found in the session... user may have navigated here by mistake');
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.session.current_import_missing', {})
        ]);
        res.redirect(`/${req.i18n.language}/${req.t('routes.publish.start')}/`);
        return undefined;
    }
    return currentFileImport;
}

function handleProcessedCSV(processedCSV: UploadDTO | UploadErrDTO, req: AuthedRequest, res: Response) {
    if (processedCSV.success) {
        const viewDTO = processedCSV as ViewDTO;
        if (!viewDTO.dataset) {
            res.status(500);
            res.render('publish/upload', processedCSV);
            return;
        }
        setCurrentToSession(viewDTO.dataset, req);
        res.redirect(`/${req.i18n.language}/publish/preview`);
    } else {
        res.status(400);
        res.render('publish/upload', processedCSV);
    }
}

async function createNewDataset(req: AuthedRequest, res: Response) {
    const lang = req.i18n.language;
    const statsWalesApi = new StatsWalesApi(lang, req.jwt);
    const title = req.session.currentTitle;
    if (!title) {
        logger.debug('Current title was missing from the session.  Something might have gone wrong');
        req.session.errors = generateViewErrors(undefined, 400, [generateError('title', 'errors.title_missing', {})]);
        res.redirect(`/${req.i18n.language}/${req.t('routes.publish.start')}/${t('routes.publish.title')}`);
        return;
    }
    const file = req.file;
    if (!file) {
        generateFileError(req, res);
        return;
    }

    const fileName = file.originalname;
    const fileData = new Blob([file.buffer], { type: file.mimetype });
    const processedCSV = await statsWalesApi.uploadCSVtoCreateDataset(fileData, fileName, title);
    handleProcessedCSV(processedCSV, req, res);
}

async function uploadNewFileToExistingDataset(req: AuthedRequest, res: Response) {
    const lang = req.i18n.language;
    const statsWalesApi = new StatsWalesApi(lang, req.jwt);
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

    const processedCSV = await statsWalesApi.uploadCSVToFixDataset(
        currentDataset.id,
        currentRevision.id,
        fileData,
        fileName
    );
    handleProcessedCSV(processedCSV, req, res);
}

function cleanupSession(req: AuthedRequest) {
    req.session.currentDataset = undefined;
    req.session.currentRevision = undefined;
    req.session.currentImport = undefined;
    req.session.dimensionCreationRequest = undefined;
    req.session.errors = undefined;
    req.session.save();
}

publish.get('/', (req: Request, res: Response) => {
    const errors = req.session.errors;
    // This is the start, there are a number of reason we can end up here
    // from errors in a previous attempt to just starting a new dataset.
    // So lets clean up any remaining session data.
    cleanupSession(req);
    res.render('publish/start', { errors });
});

publish.get('/title', (req: Request, res: Response) => {
    res.render('publish/title');
});

publish.post('/title', upload.none(), (req: Request, res: Response) => {
    if (!req.body?.title) {
        logger.error('The user failed to supply a title in the request');
        res.status(400);
        res.render(
            'publish/title',
            generateViewErrors(undefined, 500, [generateError('title', 'errors.title.missing', {})])
        );
        return;
    }
    req.session.currentTitle = req.body.title;
    res.redirect(`/${req.i18n.language}/${req.t('routes.publish.start')}/${req.t('routes.publish.upload')}`);
});

publish.get('/upload', (req: Request, res: Response) => {
    const currentTitle = req.session.currentTitle;
    const currentDataset = req.session.currentDataset;
    if (!currentDataset || !currentTitle) {
        logger.error('There is no title or currentDataset in the session.  Abandoning this create journey');
        req.session.errors = generateViewErrors(undefined, 500, [generateError('title', 'errors.title.missing', {})]);
        res.redirect(`/${req.i18n.language}/${req.t('routes.publish.start')}/${t('routes.publish.title')}`);
        return;
    }
    const title = currentDataset.datasetInfo?.find((info) => info.language === req.i18n.language) || currentTitle;
    res.render('publish/upload', { title });
});

publish.post('/upload', upload.single('csv'), async (req: AuthedRequest, res: Response) => {
    if (req.session.currentDataset) {
        await uploadNewFileToExistingDataset(req, res);
    } else {
        await createNewDataset(req, res);
    }
});

publish.get('/preview', async (req: AuthedRequest, res: Response) => {
    const lang = req.i18n.language;
    const statsWalesApi = new StatsWalesApi(lang, req.jwt);

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
    const previewData = await statsWalesApi.getDatasetDatafilePreview(
        currentDataset.id,
        currentRevision.id,
        currentFileImport.id,
        page_number,
        page_size
    );
    if (!previewData.success) {
        logger.error('Failed to get preview data from the backend');
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('preview', 'errors.preview.failed_to_get_preview', {})
        ]);
        res.redirect(`/${req.i18n.language}/${req.t('routes.publish.start')}/`);
        return;
    }
    const data = previewData as ViewDTO;
    res.render('publish/preview', data);
});

async function confirmFileUpload(
    currentDataset: DatasetDTO,
    currentRevision: RevisionDTO,
    currentFileImport: ImportDTO,
    statsWalesApi: StatsWalesApi,
    req: AuthedRequest,
    res: Response
) {
    try {
        const confirmedImport: ConfirmedImportDTO = await statsWalesApi.confirmFileImport(
            currentDataset.id,
            currentRevision.id,
            currentFileImport.id
        );
        console.log(JSON.stringify(confirmedImport, null, 2));
        if (confirmedImport.success) {
            const fileImport = confirmedImport.fileImport;
            req.session.currentImport = fileImport;
            req.session.save();
            res.status(200);
            res.render('publish/sources', { currentImport: fileImport });
        }
    } catch (err) {
        logger.error(err);
        res.status(500);
        res.render('publish/confirm', { error: err });
    }
}

async function rejectFileReturnToUpload(
    currentDataset: DatasetDTO,
    currentRevision: RevisionDTO,
    currentFileImport: ImportDTO,
    statsWalesApi: StatsWalesApi,
    req: AuthedRequest,
    res: Response
) {
    try {
        await statsWalesApi.removeFileImport(currentDataset.id, currentRevision.id, currentFileImport.id);
        req.session.currentImport = undefined;
        res.redirect(`/${req.i18n.language}/publish/title`);
    } catch (err) {
        logger.error(err);
        res.status(500);
        res.render('publish/confirm', { error: err });
    }
}

publish.post('/sources', upload.none(), async (req: AuthedRequest, res: Response) => {
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

    const lang = req.i18n.language;
    const confirmData = req.body?.confirm;
    if (!confirmData) {
        logger.error('The confirm variable is missing on the form submission');
        req.session.errors = generateViewErrors(undefined, 400, [
            generateError('confirmBtn', 'errors.confirm.missing', {})
        ]);
        res.redirect(`/${req.i18n.language}/publish/preview`);
    }
    const statsWalesApi = new StatsWalesApi(lang, req.jwt);
    if (confirmData === 'true') {
        await confirmFileUpload(currentDataset, currentRevision, currentFileImport, statsWalesApi, req, res);
    } else {
        await rejectFileReturnToUpload(currentDataset, currentRevision, currentFileImport, statsWalesApi, req, res);
    }
});

publish.get('/sources', upload.none(), (req: AuthedRequest, res: Response) => {
    const currentFileImport = checkCurrentFileImport(req, res);
    const dimensionCreationRequest = req.session.dimensionCreationRequest;
    if (!currentFileImport) {
        return;
    }
    const errs = req.session.errors;
    if (errs) {
        res.status(500);
    } else {
        res.status(200);
    }

    if (dimensionCreationRequest) {
        if (currentFileImport.sources) {
            currentFileImport.sources.forEach((source) => {
                source.type =
                    dimensionCreationRequest.find((dim) => dim.sourceId === source.id)?.sourceType ||
                    SourceType.UNKNOWN;
            });
        }
    }

    res.render('publish/sources', { errors: errs, currentImport: currentFileImport });
});

publish.post('/source-confirmation', upload.none(), async (req: AuthedRequest, res: Response) => {
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

    if (!currentFileImport.sources) {
        logger.error('No current import found in the session... user may have navigated here by mistake');
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.session.no_sources_on_import', {})
        ]);
        res.redirect(`/${req.i18n.language}/${req.t('routes.publish.start')}/`);
        return;
    }

    const dimensionCreationRequest: DimensionCreationDTO[] = currentFileImport.sources.map((source) => {
        return {
            sourceId: source.id,
            sourceType: req.body[source.id]
        };
    });
    req.session.dimensionCreationRequest = dimensionCreationRequest;
    if (dimensionCreationRequest.find((createRequest) => createRequest.sourceType === SourceType.UNKNOWN)) {
        logger.error('User failed to identify all sources');
        req.session.errors = generateViewErrors(undefined, 400, [
            generateError('session', 'errors.source.unknowns_found', {})
        ]);
        res.redirect(`/${req.i18n.language}/publish/source`);
        return;
    }
    if (
        dimensionCreationRequest.filter((createRequest) => createRequest.sourceType === SourceType.DATAVALUES).length >
        1
    ) {
        logger.error('User tried to specify multiple data value sources');
        req.session.errors = generateViewErrors(undefined, 400, [
            generateError('session', 'errors.source.multiple_datavalues', {})
        ]);
        res.redirect(`/${req.i18n.language}/publish/source`);
        return;
    }
    if (
        dimensionCreationRequest.filter((createRequest) => createRequest.sourceType === SourceType.FOOTNOTES).length > 1
    ) {
        logger.error('User tried to specify multiple footnote sources');
        req.session.errors = generateViewErrors(undefined, 400, [
            generateError('session', 'errors.source.multiple_footnotes', {})
        ]);
        res.redirect(`/${req.i18n.language}/publish/source`);
        return;
    }
    const statsWalesApi = new StatsWalesApi(req.i18n.language, req.jwt);
    try {
        const updatedDataset: UploadDTO = await statsWalesApi.sendCreateDimensionRequest(
            currentDataset.id,
            currentRevision.id,
            currentFileImport.id,
            dimensionCreationRequest
        );
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.json(updatedDataset);
    } catch (err) {
        logger.error(`Something went wrong with the Dimension Creation Request with the following error: ${err}`);
        req.session.errors = generateViewErrors(undefined, 500, [
            generateError('session', 'errors.source.dimension_creation_failed', {})
        ]);
        res.redirect(`/${req.i18n.language}/publish/source`);
    }
});
