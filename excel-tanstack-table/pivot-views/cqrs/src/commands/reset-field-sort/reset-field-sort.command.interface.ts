import type { z } from 'zod';
import type { resetFieldSortsCommandInput } from './reset-field-sort.command.input';

export type IResetFieldSortCommandInput = z.infer<
  typeof resetFieldSortsCommandInput
>;
