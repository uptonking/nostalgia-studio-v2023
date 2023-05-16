import * as z from 'zod';

import { recordIdSchema, tableIdSchema } from '@datalking/pivot-core';

export const bulkDuplicateRecordsCommandInput = z.object({
  tableId: tableIdSchema,
  ids: recordIdSchema.array().nonempty(),
});
export type IBulkDuplicateRecordsInput = z.infer<
  typeof bulkDuplicateRecordsCommandInput
>;
