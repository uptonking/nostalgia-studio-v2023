import { z } from 'zod';

import {
  SetCalendarFieldCommand,
  setCalendarFieldCommandInput,
} from '@datalking/pivot-cqrs';
import type { ICommandBus } from '@datalking/pivot-entity';

import type { publicProcedure } from '../trpc';
import { router } from '../trpc';

export const createCalendarRouter =
  (procedure: typeof publicProcedure) => (commandBus: ICommandBus) =>
    router({
      setField: procedure
        .input(setCalendarFieldCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new SetCalendarFieldCommand(input);
          return commandBus.execute<void>(cmd);
        }),
    });
