import * as z from 'zod';

import { tableIdSchema } from '@datalking/pivot-core';

export const deleteTableCommandInput = z.object({
  id: tableIdSchema,
});
export type IDeleteTableInput = z.infer<typeof deleteTableCommandInput>;
