import * as z from 'zod';

import {
  createOptionSchema,
  fieldIdSchema,
  tableIdSchema,
} from '@datalking/pivot-core';

export const createOptionCommandInput = z.object({
  tableId: tableIdSchema,
  fieldId: fieldIdSchema,
  option: createOptionSchema,
});
