import { z } from 'zod';

import {
  fieldIdSchema,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const resetFieldSortsCommandInput = z.object({
  tableId: tableIdSchema,
  viewId: viewIdSchema.optional(),
  fieldId: fieldIdSchema,
});
