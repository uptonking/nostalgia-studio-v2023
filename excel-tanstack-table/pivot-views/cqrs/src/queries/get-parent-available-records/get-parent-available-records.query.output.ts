import * as z from 'zod';

import { queryRecordSchema } from '@datalking/pivot-core';

export const getParentAvailableRecordsQueryOutput = z.object({
  records: z.array(queryRecordSchema),
});
