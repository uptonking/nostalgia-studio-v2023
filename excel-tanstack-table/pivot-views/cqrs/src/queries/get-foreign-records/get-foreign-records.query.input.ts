import * as z from 'zod';

import {
  fieldIdSchema,
  rootFilter,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const getForeignRecordsQueryInput = z.object({
  tableId: tableIdSchema,
  foreignTableId: tableIdSchema,
  fieldId: fieldIdSchema,
  viewId: viewIdSchema.optional(),
  filter: rootFilter.optional(),
});
