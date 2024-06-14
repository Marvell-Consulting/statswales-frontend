export interface FileDescription {
    id: string;
    internal_name: string;
}

export interface FileList {
    files: FileDescription[];
}

export interface FileListError {
    status: number;
    files: FileDescription[];
    error: string;
}
