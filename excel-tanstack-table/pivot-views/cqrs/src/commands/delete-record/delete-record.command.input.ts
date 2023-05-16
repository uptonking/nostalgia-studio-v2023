import * as z from 'zod';

import { recordIdSchema, tableIdSchema } from '@datalking/pivot-core';

export const deleteRecordCommandInput = z.object({
  tableId: tableIdSchema,
  id: recordIdSchema,
});
export type IDeleteRecordInput = z.infer<typeof deleteRecordCommandInput>;
