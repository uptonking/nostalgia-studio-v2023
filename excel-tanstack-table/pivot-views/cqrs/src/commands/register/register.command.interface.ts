import { type z } from 'zod';
import { type registerCommandInput } from './register.command.input';
import { type registerCommandOutput } from './register.command.output';

export type IRegisterCommandInput = z.infer<typeof registerCommandInput>;
export type IRegisterCommandOutput = z.infer<typeof registerCommandOutput>;
