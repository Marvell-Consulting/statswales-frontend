export interface FileDescription {
    id: string;
    internal_name: string;
}

export interface FileList {
    status: number;
    files: FileDescription[];
    error: string;
}
