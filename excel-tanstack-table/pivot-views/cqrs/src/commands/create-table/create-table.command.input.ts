import * as z from 'zod';

import {
  createTableSchemaSchema,
  tableEmojiSchema,
  tableIdSchema,
  tableNameSchema,
} from '@datalking/pivot-core';

export const createTableCommandInput = z.object({
  id: tableIdSchema.optional(),
  name: tableNameSchema,
  emoji: tableEmojiSchema.optional(),
  schema: createTableSchemaSchema,
});
