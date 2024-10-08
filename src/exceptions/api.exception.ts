export class ApiException extends Error {
    constructor(
        public message: string,
        public status?: number
    ) {
        super(message);
        this.name = 'ApiException';
        this.status = status;
    }
}
