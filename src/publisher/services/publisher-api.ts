import { ReadableStream } from 'node:stream/web';
import { performance } from 'node:perf_hooks';

import { ViewDTO, ViewV2DTO } from '../../shared/dtos/view-dto';
import { DatasetDTO } from '../../shared/dtos/dataset';
import { RevisionMetadataDTO } from '../../shared/dtos/revision-metadata';
import { DataTableDto } from '../../shared/dtos/data-table';
import { SourceAssignmentDTO } from '../../shared/dtos/source-assignment-dto';
import { logger as parentLogger } from '../../shared/utils/logger';
import { config } from '../../shared/config';
import { HttpMethod } from '../../shared/enums/http-method';
import { ApiException } from '../../shared/exceptions/api.exception';
import { ViewException } from '../../shared/exceptions/view.exception';
import { Locale } from '../../shared/enums/locale';
import { DatasetListItemDTO } from '../../shared/dtos/dataset-list-item';
import { TaskListState } from '../../shared/dtos/task-list-state';
import { RevisionProviderDTO } from '../../shared/dtos/revision-provider';
import { ProviderDTO } from '../../shared/dtos/provider';
import { ProviderSourceDTO } from '../../shared/dtos/provider-source';
import { TopicDTO } from '../../shared/dtos/topic';
import { OrganisationDTO } from '../../shared/dtos/organisation';
import { DimensionPatchDTO } from '../../shared/dtos/dimension-patch-dto';
import { DimensionDTO } from '../../shared/dtos/dimension';
import { DimensionMetadataDTO } from '../../shared/dtos/dimension-metadata';
import { TranslationDTO } from '../../shared/dtos/translations';
import { ResultsetWithCount } from '../../shared/interfaces/resultset-with-count';
import { FileFormat } from '../../shared/enums/file-format';
import { FactTableColumnDto } from '../../shared/dtos/fact-table-column-dto';
import { RevisionDTO } from '../../shared/dtos/revision';
import { DatasetInclude } from '../../shared/enums/dataset-include';
import { UserGroupDTO } from '../../shared/dtos/user/user-group';
import { UserGroupMetadataDTO } from '../../shared/dtos/user/user-group-metadata-dto';
import { UserGroupListItemDTO } from '../../shared/dtos/user/user-group-list-item-dto';
import { FileImportDto } from '../../shared/dtos/file-import';
import { UserDTO } from '../../shared/dtos/user/user';
import { UserCreateDTO } from '../../shared/dtos/user/user-create-dto';
import { AvailableRoles } from '../../shared/interfaces/available-roles';
import { RoleSelectionDTO } from '../../shared/dtos/user/role-selection-dto';
import { UserStatus } from '../../shared/enums/user-status';
import { AuthProvider } from '../../shared/enums/auth-providers';
import { TaskDTO } from '../../shared/dtos/task';
import { TaskDecisionDTO } from '../../shared/dtos/task-decision';
import { EventLogDTO } from '../../shared/dtos/event-log';
import { FilterTable } from '../../shared/dtos/filter-table';
import { Filter } from '../../shared/interfaces/filter';
import { SortByInterface } from '../../shared/interfaces/sort-by';
import { UnknownException } from '../../shared/exceptions/unknown.exception';
import { TaskAction } from '../../shared/enums/task-action';
import { UserGroupStatus } from '../../shared/enums/user-group-status';
import { DashboardStats } from '../../shared/interfaces/dashboard-stats';
import { BuildLogEntry } from '../../shared/dtos/build-log-entry';
import { DatasetWithBuild } from '../../shared/dtos/dataset-with-build';
import { DimensionWithBuild } from '../../shared/dtos/dimension-with-build';
import { DatasetSimilarBy } from '../../shared/enums/dataset-similar-by';
import { DataOptionsDTO } from '../../shared/interfaces/data-options';

const logger = parentLogger.child({ service: 'publisher-api' });

const logRequestTime = (method: string, url: string, start: number) => {
  const end = performance.now();
  const time = Math.round(end - start);
  const SLOW_RESPONSE_MS = 500;

  if (time > SLOW_RESPONSE_MS) {
    logger.warn(`SLOW: ${method} /${url} (${time}ms)`);
  } else {
    logger.debug(`${method} /${url} (${time}ms)`);
  }
};

interface fetchParams {
  method?: HttpMethod;
  url: string;
  query?: URLSearchParams | Record<string, any>;
  body?: FormData | string;
  json?: unknown;
  headers?: Record<string, string>;
  lang?: Locale;
}

export class PublisherApi {
  private readonly backendUrl = config.backend.url;

  constructor(
    private lang = Locale.English,
    private token?: string
  ) {
    this.lang = lang;
    this.token = token;
  }

  public async fetch(params: fetchParams): Promise<Response> {
    const { method = HttpMethod.Get, url, query, body, json, headers, lang = this.lang } = params;

    const head = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Accept-Language': lang,
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ...(json ? { 'Content-Type': 'application/json; charset=UTF-8' } : {}),
      ...headers
    };

    // if json is passed, then body will be ignored
    const data = json ? JSON.stringify(json) : body;
    const start = performance.now();
    const queryParams = new URLSearchParams(query);

    if (lang) {
      queryParams.set('lang', lang); // azure front door cache does not support passthrough of accept-language header
    }

    const qs = queryParams.size > 0 ? `?${queryParams.toString()}` : '';
    const fullUrl = `${this.backendUrl}/${url}${qs}`;

    return fetch(fullUrl, { method, headers: head, body: data })
      .then((response: Response) => {
        logRequestTime(method, url, start);
        return response;
      })
      .then(async (response: Response) => {
        if (!response.ok) {
          logger.error(
            `API request to ${this.backendUrl}/${url} failed with status '${response.status}' and message '${response.statusText}'`
          );
          const body = (await new Response(response.body).text()) || undefined;
          throw new ApiException(response.statusText, response.status, body);
        }
        return response;
      })
      .catch((error) => {
        if (error instanceof ApiException) throw error;
        logger.error(error, `An unknown error occurred attempting to fetch ${this.backendUrl}/${url}`);
        throw new UnknownException(error.message);
      });
  }

  public async ping(): Promise<boolean> {
    return this.fetch({ url: 'healthcheck' }).then(() => true);
  }

  public async getEnabledAuthProviders(): Promise<AuthProvider[]> {
    return this.fetch({ url: 'auth/providers' })
      .then((response) => response.json())
      .then((body) => body.enabled as unknown as AuthProvider[]);
  }

  public async createDataset(title: string, userGroupId: string, language?: string): Promise<DatasetDTO> {
    logger.debug(`Creating new dataset...`);
    const json = { title, user_group_id: userGroupId, language };

    return this.fetch({ url: 'dataset', method: HttpMethod.Post, json }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public async moveDatasetGroup(datasetId: string, userGroupId: string): Promise<DatasetDTO> {
    logger.debug(`Moving dataset ${datasetId} to user group ${userGroupId}...`);
    const json = { user_group_id: userGroupId };
    return this.fetch({ url: `dataset/${datasetId}/group`, method: HttpMethod.Patch, json }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public async getDataset(datasetId: string, include?: DatasetInclude): Promise<DatasetDTO> {
    const query = include ? { hydrate: include } : {};
    return this.fetch({ url: `dataset/${datasetId}`, query }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public uploadDataToDataset(datasetId: string, file: Blob, filename: string): Promise<DatasetDTO> {
    logger.debug(`Uploading file ${filename} to dataset: ${datasetId}`);
    const body = new FormData();
    body.set('csv', file, filename);

    return this.fetch({ url: `dataset/${datasetId}/data`, method: HttpMethod.Post, body }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public uploadCSVToUpdateDataset(
    datasetId: string,
    revisionId: string,
    file: Blob,
    filename: string,
    updateType: string
  ): Promise<DatasetDTO> {
    logger.debug(`Uploading file ${filename} to revision: ${revisionId}`);
    const body = new FormData();
    body.set('csv', file, filename);
    body.set('update_action', updateType);

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table`,
      method: HttpMethod.Post,
      body
    }).then((response) => response.json() as unknown as DatasetDTO);
  }

  public uploadLookupTable(datasetId: string, dimensionId: string, file: Blob, filename: string): Promise<ViewDTO> {
    logger.debug(`Uploading file ${filename} to dataset: ${datasetId}`);
    const body = new FormData();
    body.set('csv', file, filename);

    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/lookup`,
      method: HttpMethod.Post,
      body
    }).then((response) => response.json() as unknown as ViewDTO);
  }

  public uploadMeasureLookup(datasetId: string, file: Blob, filename: string): Promise<ViewDTO> {
    logger.debug(`Uploading file ${filename} to dataset: ${datasetId}`);
    const body = new FormData();
    body.set('csv', file, filename);

    return this.fetch({
      url: `dataset/${datasetId}/measure`,
      method: HttpMethod.Post,
      body
    }).then((response) => response.json() as unknown as ViewDTO);
  }

  public async getDatasetView(datasetId: string, pageNumber: number, pageSize: number): Promise<ViewDTO> {
    logger.debug(`Fetching view for dataset: ${datasetId}, page: ${pageNumber}, pageSize: ${pageSize}`);
    const query = new URLSearchParams({ page_number: String(pageNumber), page_size: String(pageSize) });

    return this.fetch({ url: `dataset/${datasetId}/view`, query }).then(
      (response) => response.json() as unknown as ViewDTO
    );
  }

  public async getUserDatasetList(
    page = 1,
    limit = 20,
    search?: string
  ): Promise<ResultsetWithCount<DatasetListItemDTO>> {
    logger.debug(`Fetching dataset list...`);
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });

    if (search) {
      query.append('search', search);
    }

    return this.fetch({ url: `dataset`, query }).then(
      (response) => response.json() as unknown as ResultsetWithCount<DatasetListItemDTO>
    );
  }

  // should only be used for developer view
  public async getFullDatasetList(
    page = 1,
    limit = 20,
    search?: string
  ): Promise<ResultsetWithCount<DatasetListItemDTO>> {
    logger.debug(`Fetching full dataset list...`);
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });

    if (search) {
      query.append('search', search);
    }

    return this.fetch({ url: `developer/dataset`, query }).then(
      (response) => response.json() as unknown as ResultsetWithCount<DatasetListItemDTO>
    );
  }

  public async getDatasetFileList(datasetId: string): Promise<FileImportDto[]> {
    logger.debug(`Fetching file list for dataset: ${datasetId}`);

    return this.fetch({ url: `dataset/${datasetId}/list-files` }).then(
      (response) => response.json() as unknown as FileImportDto[]
    );
  }

  public async getOriginalUpload(datasetId: string, revisionId: string): Promise<ReadableStream> {
    logger.debug(`Fetching raw file import for revision: ${revisionId}...`);

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table/raw`
    }).then((response) => response.body as ReadableStream);
  }

  public async getOriginalUploadMeasure(datasetId: string): Promise<ReadableStream> {
    logger.debug(`Fetching raw file import for measure on dataset: ${datasetId}...`);

    return this.fetch({
      url: `dataset/${datasetId}/measure/lookup/raw`
    }).then((response) => response.body as ReadableStream);
  }

  public async getOriginalUploadDimension(datasetId: string, dimensionId: string): Promise<ReadableStream> {
    logger.debug(`Fetching raw file import for dimension: ${dimensionId}...`);

    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/lookup/raw`
    }).then((response) => response.body as ReadableStream);
  }

  public async getAllDatasetFiles(datasetId: string): Promise<ReadableStream> {
    logger.debug(`Fetching zip file of assets for dataset ${datasetId}...`);

    return this.fetch({
      url: `dataset/${datasetId}/download`
    }).then((response) => response.body as ReadableStream);
  }

  public async getCubeFileStream(
    datasetId: string,
    revisionId: string,
    format: FileFormat,
    language: Locale,
    view?: string,
    selectedFilterOptions?: string,
    sortBy?: string
  ): Promise<ReadableStream> {
    logger.debug(`Fetching ${format} stream for revision: ${revisionId}...`);

    const searchParams = new URLSearchParams();

    if (view) {
      searchParams.set('view', view);
    }

    if (selectedFilterOptions) {
      searchParams.set('filter', selectedFilterOptions);
    }

    if (sortBy) searchParams.append('sort_by', sortBy);

    const url =
      format === FileFormat.DuckDb
        ? `dataset/${datasetId}/revision/by-id/${revisionId}/cube`
        : `dataset/${datasetId}/revision/by-id/${revisionId}/cube/${format}?${searchParams}`;
    logger.debug(`Download URL = ${url}`);
    return this.fetch({ url, lang: language }).then((response) => response.body as ReadableStream);
  }

  public async rebuildCube(datasetId: string, revisionId: string) {
    logger.debug(`Rebuilding cube for revision: ${revisionId}...`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/`,
      method: HttpMethod.Post
    });
  }

  public async getSourcesForDataset(datasetId: string): Promise<FactTableColumnDto[]> {
    logger.debug(`Fetching sources for dataset: ${datasetId}...`);

    return this.fetch({
      url: `dataset/${datasetId}/sources`
    }).then((response) => response.json() as unknown as FactTableColumnDto[]);
  }

  public async resetDimension(datasetId: string, dimensionId: string): Promise<DimensionDTO> {
    logger.debug(`Resetting dimension: ${dimensionId}`);

    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/reset`,
      method: HttpMethod.Delete
    }).then((response) => response.json() as unknown as DimensionDTO);
  }

  public async resetMeasure(datasetId: string): Promise<DatasetDTO> {
    logger.debug(`Resetting measure on dataset: ${datasetId}`);

    return this.fetch({
      url: `dataset/${datasetId}/measure/reset`,
      method: HttpMethod.Delete
    }).then((response) => response.json() as unknown as DatasetDTO);
  }

  public async getImportPreview(
    datasetId: string,
    revisionId: string,
    pageNumber: number,
    pageSize: number
  ): Promise<ViewDTO> {
    logger.debug(
      `Fetching preview for dataset: ${datasetId}, revision: ${revisionId}, page: ${pageNumber}, pageSize: ${pageSize}`
    );

    const query = new URLSearchParams({ page_number: String(pageNumber), page_size: String(pageSize) });

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table/preview`,
      query
    }).then((response) => response.json() as unknown as ViewDTO);
  }

  public async getRevision(datasetId: string, revisionId: string): Promise<RevisionDTO> {
    logger.debug(`Fetching revision: ${revisionId}`);

    return this.fetch({ url: `dataset/${datasetId}/revision/by-id/${revisionId}` }).then(
      (response) => response.json() as unknown as RevisionDTO
    );
  }

  public async getRevisionDataTable(datasetId: string, revisionId: string): Promise<DataTableDto> {
    logger.debug(`Fetching revision datatable: ${revisionId}`);

    return this.fetch({ url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table` }).then(
      (response) => response.json() as unknown as DataTableDto
    );
  }

  public async getRevisionPreview(
    datasetId: string,
    revisionId: string,
    pageNumber: number,
    pageSize: number,
    sortBy?: SortByInterface,
    filter?: Filter[]
  ): Promise<ViewDTO> {
    logger.debug(
      `Fetching preview for dataset: ${datasetId}, revision: ${revisionId}, page: ${pageNumber}, pageSize: ${pageSize}`
    );

    const query = new URLSearchParams({ page_number: String(pageNumber), page_size: String(pageSize) });

    if (filter && filter.length) {
      query.set('filter', JSON.stringify(filter));
    }

    if (sortBy) {
      query.set('sort_by', JSON.stringify([sortBy]));
    }

    return this.fetch({ url: `dataset/${datasetId}/revision/by-id/${revisionId}/preview`, query }).then(
      (response) => response.json() as unknown as ViewDTO
    );
  }

  public async getRevisionFilters(datasetId: string, revisionId: string): Promise<FilterTable[]> {
    logger.debug(`Fetching filters for dataset: ${datasetId}, revision: ${revisionId}`);

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/preview/filters`
    }).then((response) => response.json() as unknown as FilterTable[]);
  }

  public async assignSources(
    datasetId: string,
    sourceTypeAssignment: SourceAssignmentDTO[]
  ): Promise<DatasetWithBuild> {
    logger.debug(`Assigning source types for dataset: ${datasetId}`);

    return this.fetch({
      url: `dataset/${datasetId}/sources`,
      method: HttpMethod.Patch,
      json: sourceTypeAssignment
    }).then((response) => response.json() as unknown as DatasetWithBuild);
  }

  public async patchDimension(
    datasetId: string,
    dimensionId: string,
    dimensionPatch: DimensionPatchDTO
  ): Promise<ViewDTO> {
    logger.debug(`sending patch request for dimension: ${dimensionId}`);

    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}`,
      method: HttpMethod.Patch,
      json: dimensionPatch
    }).then((response) => response.json() as unknown as ViewDTO);
  }

  public async updateDimensionMetadata(
    datasetId: string,
    dimensionId: string,
    metadata: DimensionMetadataDTO
  ): Promise<DimensionWithBuild> {
    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/metadata`,
      method: HttpMethod.Patch,
      json: metadata
    }).then((response) => response.json() as unknown as DimensionWithBuild);
  }

  public async updateMetadata(datasetId: string, metadata: RevisionMetadataDTO): Promise<DatasetDTO> {
    return this.fetch({ url: `dataset/${datasetId}/metadata`, method: HttpMethod.Patch, json: metadata }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public async getTaskList(datasetId: string): Promise<TaskListState> {
    logger.debug(`Fetching tasklist for dataset: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}/tasklist` }).then(
      (response) => response.json() as unknown as TaskListState
    );
  }

  public async getDimensionPreview(datasetId: string, dimensionId: string): Promise<ViewDTO> {
    logger.debug(`Fetching dimension preview for dimension: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/preview` }).then(
      (response) => response.json() as unknown as ViewDTO
    );
  }

  public async getMeasurePreview(datasetId: string): Promise<ViewDTO> {
    logger.debug(`Fetching measure preview for dataset: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}/measure/preview` }).then(
      (response) => response.json() as unknown as ViewDTO
    );
  }

  public async getDimension(datasetId: string, dimensionId: string): Promise<DimensionDTO> {
    logger.debug(`Fetching dimension: ${dimensionId}`);
    return this.fetch({ url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/` }).then(
      (response) => response.json() as unknown as DimensionDTO
    );
  }

  public async uploadCSVtoCreateDataset(file: Blob, filename: string, title: string): Promise<DatasetDTO> {
    logger.debug(`Uploading CSV to create dataset with title '${title}'`);

    const body = new FormData();
    body.set('csv', file, filename);
    body.set('title', title);

    return this.fetch({ url: 'dataset', method: HttpMethod.Post, body })
      .then((response) => response.json() as unknown as DatasetDTO)
      .catch((error) => {
        throw new ViewException(error.message, error.status, [
          {
            field: 'csv',
            message: {
              key: 'errors.upload.no_csv_data',
              params: {}
            }
          }
        ]);
      });
  }

  public async uploadCSVToFixDataset(
    datasetId: string,
    revisionId: string,
    file: Blob,
    filename: string
  ): Promise<DatasetDTO> {
    logger.debug(`Uploading CSV to fix dataset: ${datasetId}`);

    const body = new FormData();
    body.set('csv', file, filename);

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/fact-table`,
      method: HttpMethod.Post,
      body
    })
      .then((response) => response.json() as unknown as DatasetDTO)
      .catch((error) => {
        throw new ViewException(error.message, error.status, [
          {
            field: 'csv',
            message: {
              key: 'errors.upload.no_csv_data',
              params: {}
            }
          }
        ]);
      });
  }

  public async addDatasetProvider(datasetId: string, provider: RevisionProviderDTO): Promise<DatasetDTO> {
    return this.fetch({ url: `dataset/${datasetId}/providers`, method: HttpMethod.Post, json: provider }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public async updateAssignedProviders(datasetId: string, providers: RevisionProviderDTO[]): Promise<DatasetDTO> {
    return this.fetch({ url: `dataset/${datasetId}/providers`, method: HttpMethod.Patch, json: providers }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public async getAssignedProviders(datasetId: string): Promise<RevisionProviderDTO[]> {
    logger.debug('Fetching assigned data providers...');
    return this.fetch({ url: `dataset/${datasetId}/providers`, method: HttpMethod.Get }).then(
      (response) => response.json() as unknown as RevisionProviderDTO[]
    );
  }

  public async getAllProviders(): Promise<ProviderDTO[]> {
    logger.debug('Fetching all data providers...');
    return this.fetch({ url: 'provider' }).then((response) => response.json() as unknown as ProviderDTO[]);
  }

  public async getSourcesByProvider(providerId: string): Promise<ProviderSourceDTO[]> {
    logger.debug('Fetching data provider sources...');
    return this.fetch({ url: `provider/${providerId}/sources` }).then(
      (response) => response.json() as unknown as ProviderSourceDTO[]
    );
  }

  public async getDatasetTopics(datasetId: string): Promise<TopicDTO[]> {
    logger.debug('Fetching dataset topics...');
    return this.fetch({ url: `dataset/${datasetId}/topics`, method: HttpMethod.Get }).then(
      (response) => response.json() as unknown as TopicDTO[]
    );
  }

  public async getAllTopics(): Promise<TopicDTO[]> {
    logger.debug('Fetching all topics...');
    return this.fetch({ url: 'topic' }).then((response) => response.json() as unknown as TopicDTO[]);
  }

  public async updateDatasetTopics(datasetId: string, topics: string[]): Promise<DatasetDTO> {
    return this.fetch({ url: `dataset/${datasetId}/topics`, method: HttpMethod.Patch, json: { topics } }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public async updatePublishDate(datasetId: string, revisionId: string, publishDate: string): Promise<DatasetDTO> {
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/publish-at`,
      method: HttpMethod.Patch,
      json: { publish_at: publishDate }
    }).then((response) => response.json() as unknown as DatasetDTO);
  }

  public async getAllOrganisations(): Promise<OrganisationDTO[]> {
    logger.debug('Fetching organisations...');
    return this.fetch({ url: 'organisation' }).then((response) => response.json() as unknown as OrganisationDTO[]);
  }

  public async getTranslationPreview(datasetId: string): Promise<TranslationDTO[]> {
    logger.debug('Fetching translation preview...');
    return this.fetch({ url: `translation/${datasetId}/preview` }).then(
      (response) => response.json() as unknown as TranslationDTO[]
    );
  }

  public async getTranslationExport(datasetId: string): Promise<ReadableStream> {
    logger.debug('Fetching translation export...');
    return this.fetch({ url: `translation/${datasetId}/export` }).then((response) => response.body as ReadableStream);
  }

  public async uploadTranslationImport(datasetId: string, file: Blob, filename: string): Promise<DatasetDTO> {
    logger.debug(`Uploading translations to dataset: ${datasetId}`);
    const body = new FormData();
    body.set('csv', file, filename);

    return this.fetch({ url: `translation/${datasetId}/import`, method: HttpMethod.Post, body }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public async updateTranslations(datasetId: string): Promise<DatasetDTO> {
    logger.debug(`Updating translations for dataset: ${datasetId}`);

    return this.fetch({ url: `translation/${datasetId}/import`, method: HttpMethod.Patch }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public async requestPublishing(datasetId: string, revisionId: string): Promise<DatasetDTO> {
    logger.debug(`Submitting draft revision ${revisionId} for publishing`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/submit`,
      method: HttpMethod.Post
    }).then((response) => response.json() as unknown as DatasetDTO);
  }

  public async withdrawFromPublishing(datasetId: string, revisionId: string): Promise<DatasetDTO> {
    logger.debug(`Withdrawing publishing request for draft revision ${revisionId}`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/withdraw`,
      method: HttpMethod.Post
    }).then((response) => response.json() as unknown as DatasetDTO);
  }

  public async deleteDraftDataset(datasetId: string): Promise<boolean> {
    logger.debug(`Deleting draft dataset: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}`, method: HttpMethod.Delete }).then(() => true);
  }

  public async deleteDraftRevision(datasetId: string, revisionId: string): Promise<boolean> {
    logger.debug(`Deleting draft dataset: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}/revision/by-id/${revisionId}`, method: HttpMethod.Delete }).then(
      () => true
    );
  }

  public async requestAction(datasetId: string, action: TaskAction, reason?: string): Promise<boolean> {
    logger.debug(`Submitting ${action} request for dataset: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}/${action}`, method: HttpMethod.Post, json: { reason } }).then(
      () => true
    );
  }

  public async createRevision(datasetId: string): Promise<RevisionDTO> {
    logger.debug(`Creating new revision for dataset: ${datasetId}`);
    return this.fetch({
      url: `dataset/${datasetId}/revision`,
      method: HttpMethod.Post
    }).then((response) => response.json() as unknown as RevisionDTO);
  }

  public async getDashboardStats(): Promise<DashboardStats> {
    logger.debug('Fetching dashboard stats...');
    return this.fetch({ url: 'admin/dashboard' }).then((response) => response.json() as unknown as DashboardStats);
  }

  public async listUserGroups(
    page = 1,
    limit = 20,
    search?: string
  ): Promise<ResultsetWithCount<UserGroupListItemDTO>> {
    logger.debug(`Fetching user group list...`);
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });

    if (search) {
      query.append('search', search);
    }

    return this.fetch({ url: `admin/group/list`, query }).then(
      (response) => response.json() as unknown as ResultsetWithCount<UserGroupListItemDTO>
    );
  }

  public async getAllUserGroups(status?: UserGroupStatus): Promise<UserGroupDTO[]> {
    logger.debug(`Fetching all user groups with status: ${status || 'any'}...`);
    const query = status ? { status } : {};
    return this.fetch({ url: `admin/group`, query }).then((response) => response.json() as unknown as UserGroupDTO[]);
  }

  public async getUserGroup(groupId: string): Promise<UserGroupDTO> {
    logger.debug(`Fetching user group...`);
    return this.fetch({ url: `admin/group/${groupId}` }).then((response) => response.json() as unknown as UserGroupDTO);
  }

  public async createUserGroup(meta: UserGroupMetadataDTO[]): Promise<UserGroupDTO> {
    logger.debug(`Creating new user group`);
    return this.fetch({ url: `admin/group`, method: HttpMethod.Post, json: meta }).then(
      (response) => response.json() as unknown as UserGroupDTO
    );
  }

  public async updateUserGroup(group: UserGroupDTO): Promise<UserGroupDTO> {
    logger.debug(`Updating user group`);
    return this.fetch({ url: `admin/group/${group.id}`, method: HttpMethod.Patch, json: group }).then(
      (response) => response.json() as unknown as UserGroupDTO
    );
  }

  public async updateUserGroupStatus(groupId: string, status: UserGroupStatus): Promise<UserGroupDTO> {
    logger.debug(`Updating user group status to ${status}...`);
    const json = { status };
    return this.fetch({ url: `admin/group/${groupId}/status`, method: HttpMethod.Patch, json }).then(
      (response) => response.json() as unknown as UserGroupDTO
    );
  }

  public async listUsers(page = 1, limit = 20, search?: string): Promise<ResultsetWithCount<UserDTO>> {
    logger.debug(`Fetching user list...`);
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });

    if (search) {
      query.append('search', search);
    }

    return this.fetch({ url: `admin/user`, query }).then(
      (response) => response.json() as unknown as ResultsetWithCount<UserDTO>
    );
  }

  public async createUser(userCreate: UserCreateDTO): Promise<UserDTO> {
    logger.debug(`Creating new user`);
    return this.fetch({ url: `admin/user`, method: HttpMethod.Post, json: userCreate }).then(
      (response) => response.json() as unknown as UserDTO
    );
  }

  public async getUserById(userId: string): Promise<UserDTO> {
    logger.debug(`Fetching user ${userId}...`);
    return this.fetch({ url: `admin/user/${userId}` }).then((response) => response.json() as unknown as UserDTO);
  }

  public async getAvailableUserRoles(): Promise<AvailableRoles> {
    logger.debug(`Fetching available user roles...`);
    return this.fetch({ url: `admin/role` }).then((response) => response.json() as unknown as AvailableRoles);
  }

  public async updateUserRoles(userId: string, selectedRoles: RoleSelectionDTO[]): Promise<UserDTO> {
    logger.debug(`Updating user roles`);
    return this.fetch({ url: `admin/user/${userId}/role`, method: HttpMethod.Patch, json: selectedRoles }).then(
      (response) => response.json() as unknown as UserDTO
    );
  }

  public async updateUserStatus(userId: string, status: UserStatus): Promise<UserDTO> {
    logger.debug(`Updating user status to ${status}...`);
    const json = { status };
    return this.fetch({ url: `admin/user/${userId}/status`, method: HttpMethod.Patch, json }).then(
      (response) => response.json() as unknown as UserDTO
    );
  }

  public async getTaskById(taskId: string): Promise<TaskDTO> {
    logger.debug(`Fetching task by id: ${taskId}`);
    return this.fetch({ url: `task/${taskId}` }).then((response) => response.json() as unknown as TaskDTO);
  }

  public async taskDecision(taskId: string, decisionDTO: TaskDecisionDTO): Promise<TaskDTO> {
    logger.debug(`Decision made on task ${taskId}: ${decisionDTO.decision}`);
    return this.fetch({ url: `task/${taskId}`, method: HttpMethod.Patch, json: decisionDTO }).then(
      (response) => response.json() as unknown as TaskDTO
    );
  }

  public async getDatasetHistory(datasetId: string): Promise<EventLogDTO[]> {
    logger.debug(`Fetching history for dataset ${datasetId}...`);
    return this.fetch({ url: `dataset/${datasetId}/history` }).then(
      (response) => response.json() as unknown as EventLogDTO[]
    );
  }

  public async getUser(): Promise<UserDTO> {
    logger.debug(`Fetching the current user...`);
    return this.fetch({ url: 'user' }).then((response) => response.json() as unknown as UserDTO);
  }

  public async getBuildLogEntry(buildId: string): Promise<BuildLogEntry> {
    logger.debug(`Fetching build log entry with id ${buildId}...`);
    return this.fetch({ url: `build/${buildId}` }).then((response) => response.json() as unknown as BuildLogEntry);
  }

  public async getPublicationHistory(datasetId: string): Promise<RevisionDTO[]> {
    logger.debug(`Fetching publication history for dataset: ${datasetId}`);
    return this.fetch({ url: `v1/${datasetId}/history` }).then(
      (response) => response.json() as unknown as RevisionDTO[]
    );
  }

  public async getSimilarDatasets(similarBy: DatasetSimilarBy): Promise<ReadableStream> {
    logger.debug(`Fetching similar datasets by ${similarBy}...`);
    return this.fetch({ url: `admin/similar/datasets?by=${similarBy}` }).then(
      (response) => response.body as ReadableStream
    );
  }

  public async getDatasetPreview(
    datasetId: string,
    pageNumber: number,
    pageSize: number,
    sortBy?: SortByInterface
  ): Promise<ViewV2DTO> {
    logger.debug(`Fetching dataset preview: ${datasetId}`);
    const query = new URLSearchParams({ page_number: pageNumber.toString(), page_size: pageSize.toString() });
    query.append('format', 'frontend');

    if (sortBy) {
      query.append('sort_by', JSON.stringify([sortBy]));
    }

    return this.fetch({ url: `dataset/${datasetId}/preview`, query }).then(
      (response) => response.json() as unknown as ViewV2DTO
    );
  }

  public async generateFilterId(datasetId: string, dataOptions: DataOptionsDTO): Promise<string> {
    logger.debug(`Generating filter ID for dataset preview: ${datasetId}`);

    return this.fetch({ method: HttpMethod.Post, url: `dataset/${datasetId}/preview`, json: dataOptions }).then(
      (response) => response.json().then((data) => data.filterId as string)
    );
  }

  public async getFilteredDatasetPreview(
    datasetId: string,
    filterId: string,
    pageNumber: number,
    pageSize: number,
    sortBy?: SortByInterface
  ): Promise<ViewV2DTO> {
    logger.debug(`Fetching filtered dataset preview: ${datasetId} with filter ID: ${filterId}`);
    const query = new URLSearchParams({
      page_number: pageNumber.toString(),
      page_size: pageSize.toString(),
      format: 'frontend'
    });

    if (sortBy) {
      query.append('sort_by', JSON.stringify([sortBy]));
    }

    return this.fetch({ url: `dataset/${datasetId}/preview/${filterId}`, query }).then(
      (response) => response.json() as unknown as ViewV2DTO
    );
  }

  public async downloadDatasetPreview(
    datasetId: string,
    filterId: string,
    format: FileFormat,
    language: string
  ): Promise<ReadableStream> {
    logger.debug(`Fetching ${format} stream for dataset: ${datasetId}...`);
    const query = new URLSearchParams({ format, lang: language });
    return this.fetch({ url: `dataset/${datasetId}/preview/${filterId}`, query }).then(
      (response) => response.body as ReadableStream
    );
  }

  public async downloadSearchLogs(): Promise<ReadableStream> {
    logger.debug('Fetching search logs...');
    return this.fetch({ url: 'admin/search-logs' }).then((response) => response.body as ReadableStream);
  }
}
