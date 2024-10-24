import { logger as parentLogger } from '../utils/logger';

import { StatsWalesApi } from './stats-wales-api';

const logger = parentLogger.child({ service: 'publish' });

export class PublishService {
    constructor(private api: StatsWalesApi) {}

}
