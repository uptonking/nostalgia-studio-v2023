import * as z from 'zod';

import { queryUser } from '@datalking/pivot-core';

export const getMeQuerySchema = z.object({
  me: queryUser,
});
