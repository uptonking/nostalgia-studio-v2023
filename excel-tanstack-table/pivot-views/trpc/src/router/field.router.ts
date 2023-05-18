import { z } from 'zod';

import {
  CreateFieldCommand,
  createFieldCommandInput,
  DeleteFieldCommand,
  deleteFieldCommandInput,
  UpdateFieldCommand,
  updateFieldCommandInput,
} from '@datalking/pivot-cqrs';
import type { ICommandBus } from '@datalking/pivot-entity';

import type { publicProcedure } from '../trpc';
import { router } from '../trpc';
import { createSelectFieldRouter } from './select-field.router';

export const createFieldRouter =
  (procedure: typeof publicProcedure) => (commandBus: ICommandBus) =>
    router({
      create: procedure
        .input(createFieldCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new CreateFieldCommand(input);
          return commandBus.execute(cmd);
        }),
      update: procedure
        .input(updateFieldCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new UpdateFieldCommand(input);
          return commandBus.execute(cmd);
        }),
      delete: procedure
        .input(deleteFieldCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new DeleteFieldCommand(input);
          return commandBus.execute(cmd);
        }),
      select: createSelectFieldRouter(procedure)(commandBus),
    });
