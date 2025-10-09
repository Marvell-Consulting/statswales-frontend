import 'dotenv/config';

import { config } from '../shared/config';
import app from './app';
import { logger } from '../shared/utils/logger';

const PORT = config.frontend.consumer.port;

app.listen(PORT, () => {
  logger.info(`Consumer frontend is running on port ${PORT}`);
});
