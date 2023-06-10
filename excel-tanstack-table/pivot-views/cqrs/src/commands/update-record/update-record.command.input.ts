import * as z from 'zod';

import {
  createMutateRecordValuesSchema,
  type Field,
  recordIdSchema,
  tableIdSchema,
} from '@datalking/pivot-core';

export const createUpdateRecordCommandInput = (fields: Field[]) =>
  z.object({
    tableId: tableIdSchema,
    id: recordIdSchema,
    values: createMutateRecordValuesSchema(fields),
  });

export type IUpdateRecordCommandInput = z.infer<
  ReturnType<typeof createUpdateRecordCommandInput>
>;
