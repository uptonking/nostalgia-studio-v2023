import * as z from 'zod';

import {
  fieldIdSchema,
  recordIdSchema,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const getTreeAvailableRecordsQueryInput = z.object({
  tableId: tableIdSchema,
  treeFieldId: fieldIdSchema,
  recordId: recordIdSchema.optional(),
  viewId: viewIdSchema.optional(),
});
