import path from 'node:path';

export function fileMimeTypeHandler(mimetype: string, originalFileName: string): string {
    let ext = 'unknown';
    if (mimetype === 'application/octet-stream') {
        ext = path.extname(originalFileName);
        switch (ext) {
            case '.parquet':
                return 'application/vnd.apache.parquet';
            case '.json':
                return 'application/json';
            case '.xls':
            case '.xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case '.csv':
                return 'text/csv';
            default:
                throw new Error(`unsupported format ${ext}`);
        }
    } else if (mimetype === 'application/x-gzip') {
        ext = originalFileName.split('.').reverse()[1];
        switch (ext) {
            case 'json':
            case 'csv':
                return 'application/x-gzip';
            default:
                throw new Error(`unsupported format ${ext}`);
        }
    }
    return mimetype;
}
