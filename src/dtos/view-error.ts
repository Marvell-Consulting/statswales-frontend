export interface ViewError {
    field?: string;
    tag: {
        name: string;
        params?: object;
    };
}
