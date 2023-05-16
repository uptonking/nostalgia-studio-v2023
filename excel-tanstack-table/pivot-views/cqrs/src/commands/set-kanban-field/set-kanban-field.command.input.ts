import { z } from 'zod';

import {
  setKanbanFieldSchema,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const setKanbanFieldCommandInput = z
  .object({
    tableId: tableIdSchema,
    viewId: viewIdSchema.optional(),
  })
  .merge(setKanbanFieldSchema);
