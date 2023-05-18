import { z } from 'zod';

import { collaboratorFieldValue } from '../collaborator-field.type';
import { baseFilter } from './filter.base';
import { collaboratorFilterOperators } from './operators';

export const collaboratorFilterValue = collaboratorFieldValue;
export const collaboratorFilter = z
  .object({
    type: z.literal('collaborator'),
    operator: collaboratorFilterOperators,
    value: collaboratorFilterValue,
  })
  .merge(baseFilter);

export type ICollaboratorFilter = z.infer<typeof collaboratorFilter>;
export type ICollaboratorFilterOperator = z.infer<
  typeof collaboratorFilterOperators
>;
