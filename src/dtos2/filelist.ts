export interface DatasetTitle {
    language: string;
    title: string;
}

export interface FileDescription {
    dataset_id: string;
    titles: DatasetTitle[];
}

export interface FileList {
    files: FileDescription[];
}

export interface FileListError {
    status: number;
    files: FileDescription[];
    error: string;
}
