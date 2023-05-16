import { z } from 'zod';

import { switchDisplayTypeSchema, tableIdSchema } from '@datalking/pivot-core';

export const switchDisplayTypeCommandInput = z
  .object({
    tableId: tableIdSchema,
  })
  .merge(switchDisplayTypeSchema);
