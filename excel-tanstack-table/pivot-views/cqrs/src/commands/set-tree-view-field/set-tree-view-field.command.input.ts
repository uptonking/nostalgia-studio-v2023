import { z } from 'zod';

import {
  setTreeViewFieldSchema,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const setTreeViewFieldCommandInput = z
  .object({
    tableId: tableIdSchema,
    viewId: viewIdSchema.optional(),
  })
  .merge(setTreeViewFieldSchema);
