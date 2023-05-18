import { z } from 'zod';
import { baseFilter } from './filter.base';
import { countFilterOperators } from './operators';

export const countFilterValue = z.number().nullable();
export const countFilter = z
  .object({
    type: z.literal('count'),
    operator: countFilterOperators,
    value: countFilterValue,
  })
  .merge(baseFilter);
export type ICountFilter = z.infer<typeof countFilter>;
export type ICountFilterOperator = z.infer<typeof countFilterOperators>;
