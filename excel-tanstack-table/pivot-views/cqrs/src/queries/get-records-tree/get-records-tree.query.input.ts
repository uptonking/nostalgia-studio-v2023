import * as z from 'zod';

import {
  fieldIdSchema,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const getRecordsTreeQueryInput = z.object({
  tableId: tableIdSchema,
  fieldId: fieldIdSchema,
  viewId: viewIdSchema.optional(),
});
