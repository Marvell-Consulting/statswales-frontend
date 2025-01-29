import { RevisionDTO } from '../dtos/revision';
import { FileFormat } from '../enums/file-format';

export const getDownloadHeaders = (format: FileFormat | undefined, revision: RevisionDTO) => {
    if (!format) return undefined;

    const formats = {
        csv: { ext: 'csv', contentType: 'text/csv; charset=utf-8' },
        parquet: { ext: 'parquet', contentType: 'application/vnd.apache.parquet' },
        excel: { ext: 'xlsx', contentType: 'application/vnd.ms-excel' },
        duckdb: { ext: 'duckdb', contentType: 'application/octet-stream' }
    };

    const opts = formats[format];

    if (!opts) {
        throw new Error('unsupported file format');
    }

    return {
        /* eslint-disable @typescript-eslint/naming-convention */
        'Content-Type': opts.contentType,
        'Content-disposition': `attachment;filename=${revision.id}.${opts.ext}`
        /* eslint-enable @typescript-eslint/naming-convention */
    };
};
