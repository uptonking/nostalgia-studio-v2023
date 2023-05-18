import { z } from 'zod';

import { tableIdSchema, viewIdSchema } from '@datalking/pivot-core';

export const setShowSystemFieldsCommandInput = z.object({
  tableId: tableIdSchema,
  viewId: viewIdSchema.optional(),
  showSystemFields: z.boolean(),
});
