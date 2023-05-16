import * as z from 'zod';

import { tableIdSchema } from '@datalking/pivot-core';

export const createTableCommandOutput = z.object({
  id: tableIdSchema,
});
