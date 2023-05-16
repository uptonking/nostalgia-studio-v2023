import { z } from 'zod';

import { queryUser } from '@datalking/pivot-core';

export const loginCommandInput = z.object({
  user: queryUser,
});
