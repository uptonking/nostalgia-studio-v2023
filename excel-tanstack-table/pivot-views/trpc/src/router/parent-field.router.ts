import { z } from 'zod';

import {
  GetParentAvailableRecordsQuery,
  getParentAvailableRecordsQueryInput,
} from '@datalking/pivot-cqrs';
import { type IQueryBus } from '@datalking/pivot-entity';

import { type publicProcedure } from '../trpc';
import { router } from '../trpc';

export const createParentFieldRouter =
  (procedure: typeof publicProcedure) => (queryBus: IQueryBus) =>
    router({
      available: procedure
        .input(getParentAvailableRecordsQueryInput)
        .output(z.any())
        .query(({ input }) => {
          const query = new GetParentAvailableRecordsQuery(input);
          return queryBus.execute(query);
        }),
    });
