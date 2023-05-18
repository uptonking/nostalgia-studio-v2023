import type * as z from 'zod';
import type { getMeQueryOutput } from './get-me.query.output';
import type { getMeQuerySchema } from './get-me.query.schema';

export type IGetMeQuery = z.infer<typeof getMeQuerySchema>;
export type IGetMeOutput = z.infer<typeof getMeQueryOutput>;
