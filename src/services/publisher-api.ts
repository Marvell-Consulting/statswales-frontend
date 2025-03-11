import { ReadableStream } from 'node:stream/web';

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
import { TeamDTO } from '../dtos/team';
import { DimensionPatchDTO } from '../dtos/dimension-patch-dto';
import { DimensionDTO } from '../dtos/dimension';
import { DimensionMetadataDTO } from '../dtos/dimension-metadata';
import { TranslationDTO } from '../dtos/translations';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { FileFormat } from '../enums/file-format';
import { FactTableColumnDto } from '../dtos/fact-table-column-dto';
import { RevisionDTO } from '../dtos/revision';
import { DatasetInclude } from '../enums/dataset-include';

const config = appConfig();

const logger = parentLogger.child({ service: 'publisher-api' });

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

    logger.debug(`API: ${method} /${url}`);

    return fetch(`${this.backendUrl}/${url}`, { method, headers: head, body: data })
      .then(async (response: Response) => {
        if (!response.ok) {
          const body = await new Response(response.body).text();
          if (body) {
            throw new ApiException(response.statusText, response.status, body);
          }
          throw new ApiException(response.statusText, response.status);
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

  public async createDataset(title?: string, language?: string): Promise<DatasetDTO> {
    logger.debug(`Creating new dataset...`);
    const json: RevisionMetadataDTO = { title, language };

    return this.fetch({ url: 'dataset', method: HttpMethod.Post, json }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
  }

  public async getDataset(datasetId: string, include?: DatasetInclude): Promise<DatasetDTO> {
    const url = include ? `dataset/${datasetId}/${include}` : `dataset/${datasetId}`;
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

  public async getDatasetList(page = 1, limit = 20): Promise<ResultsetWithCount<DatasetListItemDTO>> {
    logger.debug(`Fetching active dataset list...`);
    const qs = `${new URLSearchParams({ page: page.toString(), limit: limit.toString() }).toString()}`;

    return this.fetch({ url: `dataset?${qs}` }).then(
      (response) => response.json() as unknown as ResultsetWithCount<DatasetListItemDTO>
    );
  }

  public async getOriginalUpload(datasetId: string, revisionId: string): Promise<ReadableStream> {
    logger.debug(`Fetching raw file import for revision: ${revisionId}...`);

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table/raw`
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

  public async getRevisionPreview(
    datasetId: string,
    revisionId: string,
    pageNumber: number,
    pageSize: number
  ): Promise<ViewDTO> {
    logger.debug(
      `Fetching preview for dataset: ${datasetId}, revision: ${revisionId}, page: ${pageNumber}, pageSize: ${pageSize}`
    );

    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/preview?page_number=${pageNumber}&page_size=${pageSize}`
    }).then((response) => response.json() as unknown as ViewDTO);
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

  public async getAllTeams(): Promise<TeamDTO[]> {
    logger.debug('Fetching teams...');
    return this.fetch({ url: 'team' }).then((response) => response.json() as unknown as TeamDTO[]);
  }

  public async getTeam(teamId: string): Promise<TeamDTO> {
    logger.debug('Fetching team...');
    return this.fetch({ url: `team/${teamId}` }).then((response) => response.json() as unknown as TeamDTO);
  }

  public async updateDatasetTeam(datasetId: string, teamId: string): Promise<DatasetDTO> {
    logger.debug('Updating dataset team...');
    const data = { team_id: teamId };
    return this.fetch({ url: `dataset/${datasetId}/team`, method: HttpMethod.Patch, json: data }).then(
      (response) => response.json() as unknown as DatasetDTO
    );
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

  public async uploadTranslationImport(datasetId: string, file: Blob): Promise<DatasetDTO> {
    logger.debug(`Uploading translations to dataset: ${datasetId}`);
    const body = new FormData();
    body.set('csv', file);

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

  public async approveForPublication(datasetId: string, revisionId: string): Promise<DatasetDTO> {
    logger.debug(`Attempting to approve draft revision for publication`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/approve`,
      method: HttpMethod.Post
    }).then((response) => response.json() as unknown as DatasetDTO);
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
}
