import { z } from 'zod';

import { queryUser } from '@datalking/pivot-core';

export const getUsersQueryOutput = z.object({
  users: queryUser.array(),
});
