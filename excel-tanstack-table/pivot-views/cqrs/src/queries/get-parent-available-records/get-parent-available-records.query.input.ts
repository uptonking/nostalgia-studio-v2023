import * as z from 'zod';

import {
  fieldIdSchema,
  recordIdSchema,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const getParentAvailableRecordsQueryInput = z.object({
  tableId: tableIdSchema,
  parentFieldId: fieldIdSchema,
  recordId: recordIdSchema.optional(),
  viewId: viewIdSchema.optional(),
});
