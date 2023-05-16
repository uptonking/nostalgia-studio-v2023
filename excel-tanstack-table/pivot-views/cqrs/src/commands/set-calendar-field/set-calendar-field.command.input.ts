import { z } from 'zod';

import {
  setCalendarFieldSchema,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const setCalendarFieldCommandInput = z
  .object({
    tableId: tableIdSchema,
    viewId: viewIdSchema.optional(),
  })
  .merge(setCalendarFieldSchema);
