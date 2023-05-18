import { z } from 'zod';

import { userIdSchema } from '../../../user/value-objects/user-id.vo';
import { baseFilter } from './filter.base';
import { createdByFilterOperators } from './operators';

export const createdByFilterValue = userIdSchema;
export const createdByFilter = z
  .object({
    type: z.literal('created-by'),
    operator: createdByFilterOperators,
    value: createdByFilterValue,
  })
  .merge(baseFilter);

export type ICreatedByFilter = z.infer<typeof createdByFilter>;
