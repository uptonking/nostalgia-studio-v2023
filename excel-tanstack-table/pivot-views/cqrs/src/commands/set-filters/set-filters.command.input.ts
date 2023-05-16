import { z } from 'zod';

import {
  filterOrGroupList,
  tableIdSchema,
  viewIdSchema,
} from '@datalking/pivot-core';

export const setFiltersCommandInput = z.object({
  tableId: tableIdSchema,
  viewId: viewIdSchema.optional(),
  filter: filterOrGroupList.nullable(),
});
