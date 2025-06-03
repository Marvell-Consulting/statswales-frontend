import { FileFormat } from '../../app/enums/file-format';

export const getDownloadHeaders = (format: FileFormat | undefined, downloadName: string) => {
  if (!format) return undefined;

  const formats = {
    csv: { ext: 'csv', contentType: 'text/csv; charset=utf-8' },
    parquet: { ext: 'parquet', contentType: 'application/vnd.apache.parquet' },
    xlsx: { ext: 'xlsx', contentType: 'application/vnd.ms-excel' },
    duckdb: { ext: 'duckdb', contentType: 'application/octet-stream' },
    json: { ext: 'json', contentType: 'application/json' },
    odf: { ext: 'odf', contentType: 'application/vnd.oasis.opendocument.spreadsheet' },
    sqlite: { ext: 'sqlite', contentType: 'application/octet-stream' },
    zip: { ext: 'zip', contentType: 'application/zip' }
  };

  const opts = formats[format];

  if (!opts) {
    throw new Error('unsupported file format');
  }

  return {
    /* eslint-disable @typescript-eslint/naming-convention */
    'Content-Type': opts.contentType,
    'Content-disposition': `attachment;filename=${downloadName}.${opts.ext}`
    /* eslint-enable @typescript-eslint/naming-convention */
  };
};
