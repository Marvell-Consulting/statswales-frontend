import { ReadableStream } from 'node:stream/web';
import { performance } from 'node:perf_hooks';

import { ViewDTO } from '../dtos/view-dto';
import { DatasetDTO } from '../dtos/dataset';
import { RevisionMetadataDTO } from '../dtos/revision-metadata';
import { DataTableDto } from '../dtos/data-table';
import { SourceAssignmentDTO } from '../dtos/source-assignment-dto';
import { logger as parentLogger } from '../utils/logger';
import { appConfig } from '../config';
import { HttpMethod } from '../enums/http-method';
import { ApiException } from '../exceptions/api.exception';
import { ViewException } from '../exceptions/view.exception';
import { Locale } from '../enums/locale';
import { DatasetListItemDTO } from '../dtos/dataset-list-item';
import { TaskListState } from '../dtos/task-list-state';
import { RevisionProviderDTO } from '../dtos/revision-provider';
import { ProviderDTO } from '../dtos/provider';
import { ProviderSourceDTO } from '../dtos/provider-source';
import { TopicDTO } from '../dtos/topic';
import { OrganisationDTO } from '../dtos/organisation';
import { DimensionPatchDTO } from '../dtos/dimension-patch-dto';
import { DimensionDTO } from '../dtos/dimension';
import { DimensionMetadataDTO } from '../dtos/dimension-metadata';
import { TranslationDTO } from '../dtos/translations';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { FileFormat } from '../enums/file-format';
import { FactTableColumnDto } from '../dtos/fact-table-column-dto';
import { RevisionDTO } from '../dtos/revision';
import { DatasetInclude } from '../enums/dataset-include';
import { UserGroupDTO } from '../dtos/user/user-group';
import { UserGroupMetadataDTO } from '../dtos/user/user-group-metadata-dto';
import { UserGroupListItemDTO } from '../dtos/user/user-group-list-item-dto';
import { FileImportDto } from '../dtos/file-import';
import { UserDTO } from '../dtos/user/user';
import { UserCreateDTO } from '../dtos/user/user-create-dto';
import { AvailableRoles } from '../interfaces/available-roles';
import { RoleSelectionDTO } from '../dtos/user/role-selection-dto';
import { UserStatus } from '../enums/user-status';
import { AuthProvider } from '../enums/auth-providers';
import { TaskDTO } from '../dtos/task';
import { TaskDecisionDTO } from '../dtos/task-decision';
import { EventLogDTO } from '../dtos/event-log';
import { FilterTable } from '../dtos/filter-table';
import { FilterInterface } from '../interfaces/filterInterface';

const config = appConfig();

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
  url: string;
  method?: HttpMethod;
  body?: FormData | string;
  json?: unknown;
  headers?: Record<string, string>;
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

  public async fetch({ url, method = HttpMethod.Get, body, json, headers }: fetchParams): Promise<Response> {
    const head = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Accept-Language': this.lang,
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ...(json ? { 'Content-Type': 'application/json; charset=UTF-8' } : {}),
      ...headers
    };

    // if json is passed, then body will be ignored
    const data = json ? JSON.stringify(json) : body;
    const start = performance.now();

    return fetch(`${this.backendUrl}/${url}`, { method, headers: head, body: data })
      .then((response: Response) => {
        logRequestTime(method, url, start);
        return response;
      })
      .then(async (response: Response) => {
        if (!response.ok) {
          const body = (await new Response(response.body).text()) || undefined;
          throw new ApiException(response.statusText, response.status, body);
        }
        return response;
      })
      .catch((error) => {
        logger.error(`An api error occurred with status '${error.status}' and message '${error.message}'`);
        throw new ApiException(error.message, error.status, error.body);
      });
  }

  public async ping(): Promise<boolean> {
    logger.debug(`Pinging backend...`);

    return this.fetch({ url: 'healthcheck' }).then(() => {
      logger.debug('API responded to ping');
      return true;
    });
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
    const qs = include ? `${new URLSearchParams({ hydrate: include }).toString()}` : undefined;
    const url = `dataset/${datasetId}${qs ? `?${qs}` : ''}`;
    return this.fetch({ url }).then((response) => response.json() as unknown as DatasetDTO);
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

    return this.fetch({ url: `dataset/${datasetId}/view?page_number=${pageNumber}&page_size=${pageSize}` }).then(
      (response) => response.json() as unknown as ViewDTO
    );
  }

  public async getUserDatasetList(page = 1, limit = 20): Promise<ResultsetWithCount<DatasetListItemDTO>> {
    logger.debug(`Fetching user dataset list...`);
    const qs = `${new URLSearchParams({ page: page.toString(), limit: limit.toString() }).toString()}`;

    return this.fetch({ url: `dataset?${qs}` }).then(
      (response) => response.json() as unknown as ResultsetWithCount<DatasetListItemDTO>
    );
  }

  // should only be used for developer view
  public async getFullDatasetList(page = 1, limit = 20): Promise<ResultsetWithCount<DatasetListItemDTO>> {
    logger.debug(`Fetching full dataset list...`);
    const qs = `${new URLSearchParams({ page: page.toString(), limit: limit.toString() }).toString()}`;

    return this.fetch({ url: `developer/dataset?${qs}` }).then(
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

  public async getCubeFileStream(datasetId: string, revisionId: string, format: FileFormat): Promise<ReadableStream> {
    logger.debug(`Fetching ${format} stream for revision: ${revisionId}...`);

    const url =
      format === FileFormat.DuckDb
        ? `dataset/${datasetId}/revision/by-id/${revisionId}/cube`
        : `dataset/${datasetId}/revision/by-id/${revisionId}/cube/${format}`;

    return this.fetch({ url }).then((response) => response.body as ReadableStream);
  }

  public async rebuildCube(datasetId: string, revisionId: string) {
    logger.debug(`Rebuilding cube for revision: ${revisionId}...`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/`,
      method: HttpMethod.Post
    });
  }

  public async confirmDataTable(datasetId: string, revisionId: string): Promise<DataTableDto> {
    logger.debug(`Confirming data table import for revision: ${revisionId}...`);

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table/confirm`,
      method: HttpMethod.Patch
    }).then((response) => response.json() as unknown as DataTableDto);
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

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table/preview?page_number=${pageNumber}&page_size=${pageSize}`
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
    filter?: FilterInterface[]
  ): Promise<ViewDTO> {
    logger.debug(
      `Fetching preview for dataset: ${datasetId}, revision: ${revisionId}, page: ${pageNumber}, pageSize: ${pageSize}`
    );

    const query = new URLSearchParams({
      page_number: String(pageNumber),
      page_size: String(pageSize)
    });

    if (filter && filter.length) {
      query.set('filter', JSON.stringify(filter));
    }

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/preview?${query}`
    }).then((response) => response.json() as unknown as ViewDTO);
  }

  public async getRevisionFilters(datasetId: string, revisionId: string): Promise<FilterTable[]> {
    logger.debug(`Fetching filters for dataset: ${datasetId}, revision: ${revisionId}`);

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/preview/filters`
    }).then((response) => response.json() as unknown as FilterTable[]);
  }

  public async assignSources(datasetId: string, sourceTypeAssignment: SourceAssignmentDTO[]): Promise<DatasetDTO> {
    logger.debug(`Assigning source types for dataset: ${datasetId}`);

    return this.fetch({
      url: `dataset/${datasetId}/sources`,
      method: HttpMethod.Patch,
      json: sourceTypeAssignment
    }).then((response) => response.json() as unknown as DatasetDTO);
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
  ): Promise<DimensionDTO> {
    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/metadata`,
      method: HttpMethod.Patch,
      json: metadata
    }).then((response) => response.json() as unknown as DimensionDTO);
  }

  public async updateMeasureMetadata(datasetId: string, metadata: DimensionMetadataDTO): Promise<DimensionMetadataDTO> {
    return this.fetch({
      url: `dataset/${datasetId}/measure/metadata`,
      method: HttpMethod.Patch,
      json: metadata
    }).then((response) => response.json() as unknown as DimensionMetadataDTO);
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

  public async submitForPublication(datasetId: string, revisionId: string): Promise<DatasetDTO> {
    logger.debug(`Attempting to submit draft revision for publication`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/submit`,
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

  public async withdrawFromPublication(datasetId: string, revisionId: string): Promise<DatasetDTO> {
    logger.debug(`Attempting to withdraw scheduled revision from publication`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/withdraw`,
      method: HttpMethod.Post
    }).then((response) => response.json() as unknown as DatasetDTO);
  }

  public async createRevision(datasetId: string): Promise<RevisionDTO> {
    logger.debug(`Creating new revision for dataset: ${datasetId}`);
    return this.fetch({
      url: `dataset/${datasetId}/revision`,
      method: HttpMethod.Post
    }).then((response) => response.json() as unknown as RevisionDTO);
  }

  public async listUserGroups(page = 1, limit = 20): Promise<ResultsetWithCount<UserGroupListItemDTO>> {
    logger.debug(`Fetching user group list...`);
    const qs = `${new URLSearchParams({ page: page.toString(), limit: limit.toString() }).toString()}`;

    return this.fetch({ url: `admin/group/list?${qs}` }).then(
      (response) => response.json() as unknown as ResultsetWithCount<UserGroupListItemDTO>
    );
  }

  public async getAllUserGroups(): Promise<UserGroupDTO[]> {
    logger.debug(`Fetching all user groups...`);
    return this.fetch({ url: `admin/group` }).then((response) => response.json() as unknown as UserGroupDTO[]);
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

  public async listUsers(page = 1, limit = 20): Promise<ResultsetWithCount<UserDTO>> {
    logger.debug(`Fetching user list...`);
    const qs = `${new URLSearchParams({ page: page.toString(), limit: limit.toString() }).toString()}`;

    return this.fetch({ url: `admin/user?${qs}` }).then(
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
}
