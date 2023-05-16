import { z } from 'zod';

import { moveFieldSchema, tableIdSchema } from '@datalking/pivot-core';

export const moveFieldCommandInput = z
  .object({
    tableId: tableIdSchema,
  })
  .merge(moveFieldSchema);
