import * as z from 'zod';

import { fieldIdSchema, tableIdSchema } from '@datalking/pivot-core';

export const deleteFieldCommandInput = z.object({
  tableId: tableIdSchema,
  id: fieldIdSchema,
});
export type IDeleteFieldInput = z.infer<typeof deleteFieldCommandInput>;
