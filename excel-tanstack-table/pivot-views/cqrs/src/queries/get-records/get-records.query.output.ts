import * as z from 'zod';

import { queryRecordSchema } from '@datalking/pivot-core';

export const getRecordsQueryOutput = z.object({
  records: z.array(queryRecordSchema),
  total: z.number().nonnegative().int(),
});
