import { type z } from 'zod';
import { type loginCommandInput } from './login.command.input';
import { type loginCommandOutput } from './login.command.output';

export type ILoginCommandInput = z.infer<typeof loginCommandInput>;
export type ILoginCommandOutput = z.infer<typeof loginCommandOutput>;
