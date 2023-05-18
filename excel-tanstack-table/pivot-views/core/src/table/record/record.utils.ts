import fp from 'lodash/fp';
import type {
  ICreateFieldsSchema_internal,
  ICreateFieldValueSchema_internal,
} from '../field/index';
import { createFieldValueSchema_internal } from '../field/index';
import type { TableSchema } from '../value-objects/index';
import type { IMutateRecordValueSchema } from './record.schema';

const { filter, map, pipe, toPairs } = fp;

export const createRecordInputs = (
  schema: TableSchema,
  value: IMutateRecordValueSchema,
): ICreateFieldsSchema_internal => {
  return pipe(
    toPairs,
    map(([id, value]) =>
      schema.getFieldById(id).map(
        (field) =>
          ({
            type: field.type,
            field,
            value,
          } as ICreateFieldValueSchema_internal),
      ),
    ),
    filter((f) => f.isSome()),
    map((f) => f.unwrap()),
    map((f) => createFieldValueSchema_internal.parse(f)),
  )(value) as ICreateFieldsSchema_internal;
};
