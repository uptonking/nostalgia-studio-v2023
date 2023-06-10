import { z } from 'zod';

import {
  SetTreeViewFieldCommand,
  setTreeViewFieldCommandInput,
} from '@datalking/pivot-cqrs';
import { type ICommandBus } from '@datalking/pivot-entity';

import { type publicProcedure } from '../trpc';
import { router } from '../trpc';

export const createTreeViewRouter =
  (procedure: typeof publicProcedure) => (commandBus: ICommandBus) =>
    router({
      setField: procedure
        .input(setTreeViewFieldCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new SetTreeViewFieldCommand(input);
          return commandBus.execute<void>(cmd);
        }),
    });
