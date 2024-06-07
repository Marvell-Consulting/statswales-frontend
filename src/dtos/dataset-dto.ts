export interface DatafileDTO {
    id: string;
    sha256hash: string;
    created_by: string;
    creation_date: string;
}

export interface DatasetDescriptionDTO {
    description: string;
    language: string;
}

export interface DatasetTitleDTO {
    title: string;
    language: string;
}

export interface DatasetDTO {
    id: string;
    code: string;
    internal_name: string;
    title: DatasetTitleDTO[];
    description: DatasetDescriptionDTO[];
    creation_date: string;
    created_by: string;
    modification_date: string;
    modified_by: string;
    live: boolean;
    datafiles: DatafileDTO[];
    csv_link: string;
    xslx_link: string;
    view_link: string;
}
