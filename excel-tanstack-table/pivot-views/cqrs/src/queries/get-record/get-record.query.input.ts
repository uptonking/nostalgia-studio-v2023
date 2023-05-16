import * as z from 'zod';

import { recordIdSchema, tableIdSchema } from '@datalking/pivot-core';

export const getRecordQueryInput = z.object({
  tableId: tableIdSchema,
  id: recordIdSchema,
});
