import { createBackendApp } from './app';
import { canStart, config } from './shared/config';
import { logger } from './shared/logger';
import { createServerService } from './shared/server';
import { registerSocket } from './shared/socket';

(() => {
  if (!canStart()) {
    const m =
      'No PORT specified: Shutting down - Environment variables undefined';
    logger.error(m);
    throw new Error(m);
  }

  const app = createBackendApp();
  const url = config.backendBaseUrl + config.swaggerSetup.basePath;
  const title = config.swaggerSetup.info?.title;

  // Start server
  const server = createServerService(app);
  registerSocket(server);

  server.listen(config.port, () =>
    logger.info(
      `**************************************************************************\n\
      [${title}]:\n\
      Server is running with swagger docs at ⚡️ ${url}\n\
      **************************************************************************`,
    ),
  );
  return server;
})();
