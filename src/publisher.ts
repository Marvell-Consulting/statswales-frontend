import 'dotenv/config';

import { appConfig } from './shared/config';
import app from './publisher/app';
import { logger } from './shared/utils/logger';

const PORT = appConfig().frontend.publisher.port;

app.listen(PORT, () => {
  logger.info(`Publisher frontend is running on port ${PORT}`);
});
