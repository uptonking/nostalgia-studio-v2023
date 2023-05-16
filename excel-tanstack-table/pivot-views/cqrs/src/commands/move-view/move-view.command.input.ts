import { z } from 'zod';

import { moveViewSchema, tableIdSchema } from '@datalking/pivot-core';

export const moveViewCommandInput = z
  .object({
    tableId: tableIdSchema,
  })
  .merge(moveViewSchema);
