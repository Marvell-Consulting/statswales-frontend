import 'dotenv/config';

import { config } from '../shared/config';
import app from './app';
import { logger } from '../shared/utils/logger';

const PORT = config.frontend.publisher.port;

app.listen(PORT, () => {
  logger.info(
    { event: 'app_boot', service: 'publisher', gitSha: config.build.gitSha, appEnv: config.env, port: PORT },
    `Publisher frontend is running on port ${PORT}`
  );
});
