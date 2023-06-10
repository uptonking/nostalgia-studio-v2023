import { type z } from 'zod';
import { type setPinnedFieldsCommandInput } from './set-pinned-fields.command.input';

export type ISetPinnedFieldsCommandInput = z.infer<
  typeof setPinnedFieldsCommandInput
>;
