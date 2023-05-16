import * as z from 'zod';

import { queryRecordSchema } from '@datalking/pivot-core';

export const getForeignRecordsQueryOutput = z.object({
  records: z.array(queryRecordSchema),
});
