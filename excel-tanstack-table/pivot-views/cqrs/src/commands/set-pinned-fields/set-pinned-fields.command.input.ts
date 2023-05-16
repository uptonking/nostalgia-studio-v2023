import { z } from 'zod';

import { setPinnedFieldsSchema, tableIdSchema } from '@datalking/pivot-core';

export const setPinnedFieldsCommandInput = z
  .object({
    tableId: tableIdSchema,
  })
  .merge(setPinnedFieldsSchema);
