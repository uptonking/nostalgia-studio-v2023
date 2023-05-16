import * as z from 'zod';

import { recordIdSchema, tableIdSchema } from '@datalking/pivot-core';

export const bulkDeleteRecordsCommandInput = z.object({
  tableId: tableIdSchema,
  ids: recordIdSchema.array().nonempty(),
});
export type IBulkDeleteRecordsInput = z.infer<
  typeof bulkDeleteRecordsCommandInput
>;
