import { type z } from 'zod';
import { type updateViewNameCommandInput } from './update-view-name.command.input';

export type IUpdateViewNameCommandInput = z.infer<
  typeof updateViewNameCommandInput
>;
