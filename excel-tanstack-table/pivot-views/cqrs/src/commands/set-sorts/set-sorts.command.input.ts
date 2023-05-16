import { z } from 'zod';

import {
  sortsSchema,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const setSortsCommandInput = z.object({
  tableId: tableIdSchema,
  viewId: viewIdSchema.optional(),
  sorts: sortsSchema,
});
