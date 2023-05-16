import { z } from 'zod';

import { tableIdSchema, updateTableSchema } from '@datalking/pivot-core';

export const updateTableCommandInput = z
  .object({
    id: tableIdSchema,
  })
  .merge(updateTableSchema);
