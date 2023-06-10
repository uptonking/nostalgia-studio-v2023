import { z } from 'zod';

import {
  GetRecordsTreeQuery,
  getRecordsTreeQueryInput,
  GetTreeAvailableRecordsQuery,
  getTreeAvailableRecordsQueryInput,
  getTreeAvailableRecordsQueryOutput,
} from '@datalking/pivot-cqrs';
import { type IQueryBus } from '@datalking/pivot-entity';

import { type publicProcedure } from '../trpc';
import { router } from '../trpc';

export const createTreeFieldRouter =
  (procedure: typeof publicProcedure) => (queryBus: IQueryBus) =>
    router({
      list: procedure
        .input(getRecordsTreeQueryInput)
        .output(z.any())
        .query(({ input }) => {
          const query = new GetRecordsTreeQuery(input);
          return queryBus.execute(query);
        }),
      available: procedure
        .input(getTreeAvailableRecordsQueryInput)
        .output(getTreeAvailableRecordsQueryOutput)
        .query(({ input }) => {
          const query = new GetTreeAvailableRecordsQuery(input);
          return queryBus.execute(query);
        }),
    });
