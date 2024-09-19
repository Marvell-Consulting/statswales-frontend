export interface ViewError {
    field: string | undefined;
    tag: {
        name: string;
        params: object;
    };
}
