import 'dotenv/config';

import { appConfig } from './config';
import app from './app';
import { logger } from './utils/logger';

const PORT = appConfig().frontend.port;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
