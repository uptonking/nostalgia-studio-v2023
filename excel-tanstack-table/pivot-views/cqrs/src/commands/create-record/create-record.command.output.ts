import * as z from 'zod';

import { recordIdSchema } from '@datalking/pivot-core';

export const createRecordCommandOutput = z.object({
  id: recordIdSchema,
});

export type ICreateRecordOutput = z.infer<typeof createRecordCommandOutput>;
