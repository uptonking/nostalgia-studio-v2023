import * as z from 'zod';

import {
  createMutateRecordValuesSchema,
  Field,
  recordIdSchema,
  tableIdSchema,
} from '@datalking/pivot-core';

export const createCreateRecordCommandInput = (fields: Field[]) =>
  z.object({
    tableId: tableIdSchema,
    id: recordIdSchema.optional(),
    values: createMutateRecordValuesSchema(fields),
  });

export type ICreateRecordInput = z.infer<
  ReturnType<typeof createCreateRecordCommandInput>
>;
