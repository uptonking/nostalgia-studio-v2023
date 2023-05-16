import * as z from 'zod';

import {
  fieldIdSchema,
  optionIdSchema,
  tableIdSchema,
} from '@datalking/pivot-core';

export const deleteOptionCommandInput = z.object({
  tableId: tableIdSchema,
  fieldId: fieldIdSchema,
  id: optionIdSchema,
});
export type IDeleteOptionInput = z.infer<typeof deleteOptionCommandInput>;
