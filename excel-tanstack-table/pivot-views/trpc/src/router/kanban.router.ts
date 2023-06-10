import { z } from 'zod';

import {
  SetKanbanFieldCommand,
  setKanbanFieldCommandInput,
} from '@datalking/pivot-cqrs';
import { type ICommandBus } from '@datalking/pivot-entity';

import { type publicProcedure } from '../trpc';
import { router } from '../trpc';

export const createKanbanRouter =
  (procedure: typeof publicProcedure) => (commandBus: ICommandBus) =>
    router({
      setField: procedure
        .input(setKanbanFieldCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new SetKanbanFieldCommand(input);
          return commandBus.execute<void>(cmd);
        }),
    });
