import * as z from 'zod';

import { tableIdSchema, viewIdSchema } from '@datalking/pivot-core';

export const duplicateViewCommandInput = z.object({
  tableId: tableIdSchema,
  id: viewIdSchema,
});
export type IDuplicateViewInput = z.infer<typeof duplicateViewCommandInput>;
