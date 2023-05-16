import { z } from 'zod';

import { createViewSchema, tableIdSchema } from '@datalking/pivot-core';

export const createViewCommandInput = z.object({
  tableId: tableIdSchema,
  view: createViewSchema,
});
