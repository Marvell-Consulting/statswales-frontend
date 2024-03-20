export interface File {
    path: string;
    filename: string;
    isDirectory: boolean;
}

export interface FileList {
    files: File[];
}
