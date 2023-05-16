import * as z from 'zod';

import { tableIdSchema, viewIdSchema } from '@datalking/pivot-core';

export const deleteViewCommandInput = z.object({
  tableId: tableIdSchema,
  id: viewIdSchema,
});
export type IDeleteViewInput = z.infer<typeof deleteViewCommandInput>;
