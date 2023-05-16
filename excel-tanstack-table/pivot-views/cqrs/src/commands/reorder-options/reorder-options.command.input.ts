import { z } from 'zod';

import { reorderOptionsSchema, tableIdSchema } from '@datalking/pivot-core';

export const reorderOptionsCommandInput = z
  .object({
    tableId: tableIdSchema,
  })
  .merge(reorderOptionsSchema);
