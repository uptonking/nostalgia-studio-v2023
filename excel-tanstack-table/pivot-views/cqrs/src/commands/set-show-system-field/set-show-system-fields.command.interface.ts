import type { z } from 'zod';

import type {
  setShowSystemFieldsCommandInput,
} from './set-show-system-fields.command.input';

export type ISetShowSystemFieldsCommandInput = z.infer<
  typeof setShowSystemFieldsCommandInput
>;
