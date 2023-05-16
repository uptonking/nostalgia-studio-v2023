import * as z from 'zod';

import { recordIdSchema, tableIdSchema } from '@datalking/pivot-core';

export const duplicateRecordCommandInput = z.object({
  tableId: tableIdSchema,
  id: recordIdSchema,
});
export type IDuplicateRecordInput = z.infer<typeof duplicateRecordCommandInput>;
