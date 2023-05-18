import type { z } from 'zod';
import type { updateTableCommandInput } from './update-table.command.input';

export type IUpdateTableCommandInput = z.infer<typeof updateTableCommandInput>;
