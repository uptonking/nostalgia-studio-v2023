import { z } from 'zod';

import {
  CreateTableCommand,
  createTableCommandInput,
  createTableCommandOutput,
  DeleteTableCommand,
  deleteTableCommandInput,
  GetTableQuery,
  getTableQuerySchema,
  GetTablesQuery,
  getTablesQuerySchema,
  UpdateTableCommand,
  updateTableCommandInput,
} from '@datalking/pivot-cqrs';
import type { ICommandBus, IQueryBus } from '@datalking/pivot-entity';

import type { publicProcedure } from '../trpc';
import { router } from '../trpc';
import { createFieldRouter } from './field.router';
import { createViewRouter } from './view.router';

export const createTableRouter =
  (procedure: typeof publicProcedure) =>
  (commandBus: ICommandBus, queryBus: IQueryBus) =>
    router({
      get: procedure
        .input(getTableQuerySchema)
        .output(z.any())
        .query(({ input }) => {
          const query = new GetTableQuery({ id: input.id });
          return queryBus.execute(query);
        }),
      list: procedure
        .input(getTablesQuerySchema)
        .output(z.any())
        .query(() => {
          const query = new GetTablesQuery();
          return queryBus.execute(query);
        }),
      create: procedure
        .input(createTableCommandInput)
        .output(createTableCommandOutput)
        .mutation(({ input }) => {
          const cmd = new CreateTableCommand(input);
          return commandBus.execute(cmd);
        }),
      update: procedure
        .input(updateTableCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new UpdateTableCommand(input);
          return commandBus.execute(cmd);
        }),
      delete: procedure
        .input(deleteTableCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new DeleteTableCommand(input);
          return commandBus.execute(cmd);
        }),
      field: createFieldRouter(procedure)(commandBus),
      view: createViewRouter(procedure)(commandBus),
    });
