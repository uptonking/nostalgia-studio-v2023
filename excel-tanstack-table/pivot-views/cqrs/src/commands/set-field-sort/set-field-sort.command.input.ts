import { z } from 'zod';

import {
  fieldIdSchema,
  sortDirection,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const setFieldSortsCommandInput = z.object({
  tableId: tableIdSchema,
  viewId: viewIdSchema.optional(),
  fieldId: fieldIdSchema,
  direction: sortDirection,
});
