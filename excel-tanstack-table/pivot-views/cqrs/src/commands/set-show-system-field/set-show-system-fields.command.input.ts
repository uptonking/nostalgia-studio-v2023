import { z } from 'zod';

import { tableIdSchema, viewIdSchema } from '@datalking/pivot-core';

export const setShowSystemFieldssCommandInput = z.object({
  tableId: tableIdSchema,
  viewId: viewIdSchema.optional(),
  showSystemFields: z.boolean(),
});
