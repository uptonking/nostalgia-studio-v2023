import * as z from 'zod';

import {
  fieldIdSchema,
  optionIdSchema,
  tableIdSchema,
  updateOptionSchema,
} from '@datalking/pivot-core';

export const updateOptionCommandInput = z.object({
  tableId: tableIdSchema,
  fieldId: fieldIdSchema,
  id: optionIdSchema,
  option: updateOptionSchema,
});
