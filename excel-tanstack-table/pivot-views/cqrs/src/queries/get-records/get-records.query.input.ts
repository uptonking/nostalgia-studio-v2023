import * as z from 'zod';

import { rootFilter, tableIdSchema, viewIdSchema } from '@datalking/pivot-core';

export const getRecordsQueryInput = z.object({
  tableId: tableIdSchema,
  viewId: viewIdSchema.optional(),
  filter: rootFilter.optional(),
});
