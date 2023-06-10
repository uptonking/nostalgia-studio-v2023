import {
  GetUsersQuery,
  getUsersQueryOutput,
  getUsersQuerySchema,
} from '@datalking/pivot-cqrs';
import { type ICommandBus, type IQueryBus } from '@datalking/pivot-entity';

import { type publicProcedure } from '../trpc';
import { router } from '../trpc';

export const createUserRouter =
  (procedure: typeof publicProcedure) =>
  (commandBus: ICommandBus, queryBus: IQueryBus) =>
    router({
      users: procedure
        .input(getUsersQuerySchema)
        .output(getUsersQueryOutput)
        .query(() => {
          const query = new GetUsersQuery();
          return queryBus.execute(query);
        }),
    });
