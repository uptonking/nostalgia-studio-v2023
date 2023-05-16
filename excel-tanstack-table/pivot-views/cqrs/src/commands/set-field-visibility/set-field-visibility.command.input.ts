import { z } from 'zod';

import { setFieldVisibilitySchema, tableIdSchema } from '@datalking/pivot-core';

export const setFieldVisibilityCommandInput = z
  .object({
    tableId: tableIdSchema,
  })
  .merge(setFieldVisibilitySchema);
