export class NotFoundException extends Error {
    constructor(
        public message: string,
        public status = 404
    ) {
        super(message);
        this.name = 'NotFoundException';
        this.status = status;
    }
}
