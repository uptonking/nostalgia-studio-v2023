import { type z } from 'zod';

import { type createViewCommandInput } from './create-view.command.input';

export type ICreateViewCommandInput = z.infer<typeof createViewCommandInput>;
