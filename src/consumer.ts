import 'dotenv/config';

import { appConfig } from './shared/config';
import app from './consumer/app';
import { logger } from './shared/utils/logger';

const PORT = appConfig().frontend.consumer.port;

app.listen(PORT, () => {
  logger.info(`Consumer frontend is running on port ${PORT}`);
});
