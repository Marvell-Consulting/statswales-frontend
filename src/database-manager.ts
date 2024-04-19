import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Datafile } from './entity/Datafile';

class DatabaseManager {
    private datasourceOptions: DataSourceOptions;
    private dataSource: DataSource;

    constructor(private config: DataSourceOptions) {
        this.datasourceOptions = config;
    }

    getDataSource() {
        return this.dataSource;
    }

    async initializeDataSource() {
        this.dataSource = new DataSource({
            ...this.datasourceOptions,
            entities: [Datafile]
        });

        await this.dataSource
            .initialize()
            .then(() => {
                console.log('Data source initialized');
            })
            .catch((error) => console.log(error));
    }
}

export default DatabaseManager;
