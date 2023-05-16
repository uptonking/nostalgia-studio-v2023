import { z } from 'zod';

import { queryUser } from '@datalking/pivot-core';

export const getMeQueryOutput = z.object({
  me: queryUser,
});
