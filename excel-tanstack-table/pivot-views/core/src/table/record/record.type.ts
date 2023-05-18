import { z } from 'zod';
import { userIdSchema } from '../../user/value-objects/user-id.vo';
import {
  collaboratorProfile,
  createFieldsSchema_internal,
  fieldQueryValue,
} from '../field/index';
import { fieldIdSchema } from '../field/value-objects/field-id.schema';
import { TableId, tableIdSchema } from '../value-objects/index';
import type { Record } from './record';
import { recordIdSchema } from './value-objects/record-id.schema';

export type Records = Record[];

export const createRecordInput_internal = z.object({
  id: recordIdSchema.optional(),
  tableId: z.instanceof(TableId),
  value: createFieldsSchema_internal,
});
export type ICreateRecordInput_internal = z.infer<
  typeof createRecordInput_internal
>;

const queryRecordValues = z.record(fieldIdSchema, fieldQueryValue);
export type IQueryRecordValues = z.infer<typeof queryRecordValues>;

export const recordDisplayValues = z.record(
  fieldIdSchema,
  z.record(z.array(z.string().nullable()).nullable()),
);
export type IRecordDisplayValues = z.infer<typeof recordDisplayValues>;

export const queryRecordSchema = z.object({
  id: recordIdSchema,
  tableId: tableIdSchema,
  createdAt: z.string().datetime(),
  createdBy: userIdSchema,
  createdByProfile: collaboratorProfile.nullable(),
  updatedAt: z.string().datetime(),
  updatedBy: userIdSchema,
  updatedByProfile: collaboratorProfile.nullable(),
  autoIncrement: z.number().int().positive().optional(),
  values: queryRecordValues,
  displayValues: recordDisplayValues,
});
export type IQueryRecordSchema = z.infer<typeof queryRecordSchema>;

export const queryRecords = z.array(queryRecordSchema);
export type IQueryRecords = z.infer<typeof queryRecords>;

export type IQueryTreeRecord = IQueryRecordSchema & {
  children: IQueryTreeRecords;
};
export type IQueryTreeRecords = Array<IQueryTreeRecord>;
export const queryTreeRecords: z.ZodType<IQueryTreeRecords> = z.lazy(() =>
  queryRecordSchema.merge(z.object({ children: queryTreeRecords })).array(),
);
