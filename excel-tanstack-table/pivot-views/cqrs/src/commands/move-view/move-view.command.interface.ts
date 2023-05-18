import type { z } from 'zod';
import type { moveViewCommandInput } from './move-view.command.input';

export type IMoveViewCommandInput = z.infer<typeof moveViewCommandInput>;
