import { z } from 'zod';

import { setFieldWidthSchema, tableIdSchema } from '@datalking/pivot-core';

export const setFieldWidthCommandInput = z
  .object({
    tableId: tableIdSchema,
  })
  .merge(setFieldWidthSchema);
