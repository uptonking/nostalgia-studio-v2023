import * as z from 'zod';

import { queryTreeRecords } from '@datalking/pivot-core';

export const getRecordsTreeQueryOutput = z.object({
  records: queryTreeRecords,
});
