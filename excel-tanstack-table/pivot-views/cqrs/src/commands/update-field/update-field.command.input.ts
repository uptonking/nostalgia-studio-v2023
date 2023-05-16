import { z } from 'zod';

import {
  fieldIdSchema,
  tableIdSchema,
  updateFieldSchema,
} from '@datalking/pivot-core';

export const updateFieldCommandInput = z.object({
  tableId: tableIdSchema,
  fieldId: fieldIdSchema,
  field: updateFieldSchema,
});
