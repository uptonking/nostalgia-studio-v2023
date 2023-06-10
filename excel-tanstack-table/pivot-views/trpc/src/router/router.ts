import { type ICommandBus, type IQueryBus } from '@datalking/pivot-entity';

import { middleware, publicProcedure, router } from '../trpc';
import { type ILogger } from '../type';
import { createRecordRouter } from './record.router';
import { createTableRouter } from './table.router';
import { createUserRouter } from './user.router';

export const createRouter = (
  commandBus: ICommandBus,
  queryBus: IQueryBus,
  logger: ILogger,
) => {
  const procedure = publicProcedure.use(
    middleware(async ({ path, type, next, rawInput }) => {
      const start = Date.now();
      const result = await next();
      const durationMs = Date.now() - start;

      if (result.ok) {
        logger.log('OK request', { path, type, durationMs, rawInput });
      } else {
        logger.error('Non-OK request', {
          path,
          type,
          durationMs,
          rawInput,
          // @ts-expect-error fix-types
          error: result.error,
          // @ts-expect-error fix-types
          msg: result.error.message,
          // @ts-expect-error fix-types
          stack: result.error.stack,
        });
      }

      return result;
    }),
  );
  const appRouter = router({
    table: createTableRouter(procedure)(commandBus, queryBus),
    record: createRecordRouter(procedure)(commandBus, queryBus),
    user: createUserRouter(procedure)(commandBus, queryBus),
  });
  return appRouter;
};

export type AppRouter = ReturnType<typeof createRouter>;
