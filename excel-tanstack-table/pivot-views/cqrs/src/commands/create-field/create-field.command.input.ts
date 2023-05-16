import { z } from 'zod';

import {
  createFieldSchema,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const createFieldCommandInput = z.object({
  tableId: tableIdSchema,
  field: createFieldSchema,
  viewId: viewIdSchema.optional(),
  at: z.number().nonnegative().int().optional(),
});
