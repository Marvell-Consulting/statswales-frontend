import 'dotenv/config';

import { config } from '../shared/config';
import app from './app';
import { logger } from '../shared/utils/logger';

const PORT = config.frontend.consumer.port;

app.listen(PORT, () => {
  logger.info(
    { event: 'app_boot', service: 'consumer', gitSha: config.build.gitSha, appEnv: config.env, port: PORT },
    `Consumer frontend is running on port ${PORT}`
  );
});
