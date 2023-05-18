import { z } from 'zod';

import { lookupFieldValue } from '../lookup-field.type';
import { baseFilter } from './filter.base';
import { lookupFilterOperators } from './operators';

export const lookupFilterValue = lookupFieldValue
  .or(lookupFieldValue.unwrap())
  .nullable();
export type ILookupFilterValue = z.infer<typeof lookupFieldValue>;
export const lookupFilter = z
  .object({
    type: z.literal('lookup'),
    operator: lookupFilterOperators,
    value: lookupFilterValue,
  })
  .merge(baseFilter);

export type ILookupFilter = z.infer<typeof lookupFilter>;
