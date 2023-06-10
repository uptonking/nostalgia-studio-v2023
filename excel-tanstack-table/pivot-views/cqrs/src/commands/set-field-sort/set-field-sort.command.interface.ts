import { type z } from 'zod';
import { type setFieldSortsCommandInput } from './set-field-sort.command.input';

export type ISetFieldSortCommandInput = z.infer<
  typeof setFieldSortsCommandInput
>;
