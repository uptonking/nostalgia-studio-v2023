import { z } from 'zod';

import {
  ResetFieldSortCommand,
  resetFieldSortsCommandInput,
  SetFieldSortCommand,
  setFieldSortsCommandInput,
  SetSortsCommand,
  setSortsCommandInput,
} from '@datalking/pivot-cqrs';
import type { ICommandBus } from '@datalking/pivot-entity';

import type { publicProcedure } from '../trpc';
import { router } from '../trpc';

export const createSortRouter =
  (procedure: typeof publicProcedure) => (commandBus: ICommandBus) =>
    router({
      set: procedure
        .input(setSortsCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new SetSortsCommand(input);
          return commandBus.execute<void>(cmd);
        }),
      setFieldSort: procedure
        .input(setFieldSortsCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new SetFieldSortCommand(input);
          return commandBus.execute<void>(cmd);
        }),
      resetFieldSort: procedure
        .input(resetFieldSortsCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new ResetFieldSortCommand(input);
          return commandBus.execute<void>(cmd);
        }),
    });
