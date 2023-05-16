import { z } from 'zod';

import { tableIdSchema, updateViewNameSchema } from '@datalking/pivot-core';

export const updateViewNameCommandInput = z.object({
  tableId: tableIdSchema,
  view: updateViewNameSchema,
});
