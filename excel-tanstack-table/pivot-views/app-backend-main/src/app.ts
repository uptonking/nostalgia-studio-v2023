import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { router } from './routes';
import { modelAuthMiddleware } from './shared/auth';
import { authProviderAutoConfigure } from './shared/auth/sync';
import { config } from './shared/config';
import { Connection } from './shared/db';
import { checkDatabase } from './shared/db/check';
import { errorHandler } from './shared/errorHandler';
import { registerModelApiRoutes } from './shared/model-api/routes';
import { prepareSwagger } from './shared/model-api/swagger';
import { homepage } from './shared/server';
import { loadSettingsAsync } from './shared/settings';
import {
  activateAxiosTrace,
  endpointTracingMiddleware,
  printRouteSummary,
} from './shared/trace';

export interface BackendApp extends express.Express {
  onStartupCompletePromise: Promise<boolean[]>;
}

export interface BackendOptions {
  checks?: boolean;
  trace?: boolean;
}

/**
 * connect-db + config-express + routes
 */
export function createBackendApp(
  { checks, trace }: BackendOptions = { checks: true },
): BackendApp {
  const app = express() as BackendApp;

  if (trace !== undefined) {
    config.trace = trace;
    config.db.trace = trace;
  }

  if (!config.production && config.trace) {
    activateAxiosTrace();
  }

  // Startup
  Connection.init();
  const promises = [
    checks
      ? checkDatabase()
          .then(async (ok) => (ok ? await loadSettingsAsync() : ok))
          .then(async (ok) => (ok ? await authProviderAutoConfigure() : ok))
      : Promise.resolve(true),
  ];

  // Add Middlewares - Order matters
  app.use(cors());
  app.use(express.json({ limit: config.jsonLimit }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(endpointTracingMiddleware);
  app.use(modelAuthMiddleware);

  // Add Routes
  registerModelApiRoutes(Connection.entities, router);
  app.use(router);

  const swaggerDoc = prepareSwagger(app, Connection.entities);
  app.use(
    config.swaggerSetup.basePath,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, {
      customSiteTitle: config.swaggerSetup.info?.title,
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  app.onStartupCompletePromise = Promise.all(promises);

  printRouteSummary(app);

  app.get('/', homepage);

  app.use(errorHandler);

  return app;
}

export default createBackendApp;
