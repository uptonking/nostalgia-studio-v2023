import type * as z from 'zod';

import type { getUsersQueryOutput } from './get-uesrs.query.output';
import type { getUsersQuerySchema } from './get-users.query.schema';

export type IGetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type IGetUsersOutput = z.infer<typeof getUsersQueryOutput>;
