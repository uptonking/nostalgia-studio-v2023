import { z } from 'zod';

import {
  CreateViewCommand,
  createViewCommandInput,
  DeleteViewCommand,
  deleteViewCommandInput,
  DuplicateViewCommand,
  duplicateViewCommandInput,
  MoveViewCommand,
  moveViewCommandInput,
  SetShowSystemFieldsCommand,
  setShowSystemFieldsCommandInput,
  SwitchDisplayTypeCommand,
  switchDisplayTypeCommandInput,
  UpdateViewNameCommand,
  updateViewNameCommandInput,
} from '@datalking/pivot-cqrs';
import { type ICommandBus } from '@datalking/pivot-entity';

import { type publicProcedure } from '../trpc';
import { router } from '../trpc';
import { createCalendarRouter } from './calendar.router';
import { createFilterRouter } from './filter.router';
import { createKanbanRouter } from './kanban.router';
import { createSortRouter } from './sort.router';
import { createTreeViewRouter } from './tree-view.router';
import { createViewFieldRouter } from './view-field.router';

export const createViewRouter =
  (procedure: typeof publicProcedure) => (commandBus: ICommandBus) =>
    router({
      create: procedure
        .input(createViewCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new CreateViewCommand(input);
          return commandBus.execute(cmd);
        }),
      duplicate: procedure
        .input(duplicateViewCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new DuplicateViewCommand(input);
          return commandBus.execute(cmd);
        }),
      updateName: procedure
        .input(updateViewNameCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new UpdateViewNameCommand(input);
          return commandBus.execute(cmd);
        }),
      move: procedure
        .input(moveViewCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new MoveViewCommand(input);
          return commandBus.execute(cmd);
        }),
      delete: procedure
        .input(deleteViewCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new DeleteViewCommand(input);
          return commandBus.execute(cmd);
        }),
      switchDisplayType: procedure
        .input(switchDisplayTypeCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new SwitchDisplayTypeCommand(input);
          return commandBus.execute<void>(cmd);
        }),
      setShowSystemFields: procedure
        .input(setShowSystemFieldsCommandInput)
        .output(z.void())
        .mutation(({ input }) => {
          const cmd = new SetShowSystemFieldsCommand(input);
          return commandBus.execute(cmd);
        }),
      field: createViewFieldRouter(procedure)(commandBus),
      filter: createFilterRouter(procedure)(commandBus),
      sort: createSortRouter(procedure)(commandBus),
      kanban: createKanbanRouter(procedure)(commandBus),
      calendar: createCalendarRouter(procedure)(commandBus),
      tree: createTreeViewRouter(procedure)(commandBus),
    });
