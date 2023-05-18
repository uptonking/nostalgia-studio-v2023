import type { Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';

import { CompositeSpecification } from '@datalking/pivot-entity';

import type { ICreateFieldsSchema_internal } from '../../field/index';
import type { TableSchemaIdMap } from '../../value-objects/index';
import type { Record } from '../record';
import type { IQueryRecordValues } from '../record.type';
import { RecordValues } from '../value-objects/index';
import type { IRecordVisitor } from './interface';

export class WithRecordValues extends CompositeSpecification<
  Record,
  IRecordVisitor
> {
  constructor(public readonly values: RecordValues) {
    super();
  }

  static fromArray(values: ICreateFieldsSchema_internal): WithRecordValues {
    return new this(RecordValues.fromArray(values));
  }

  static fromObject(
    schema: TableSchemaIdMap,
    values: IQueryRecordValues,
  ): WithRecordValues {
    return new this(RecordValues.fromObject(schema, values));
  }

  isSatisfiedBy(t: Record): boolean {
    return t.values.equals(this.values);
  }

  mutate(t: Record): Result<Record, string> {
    t.values = this.values;
    return Ok(t);
  }

  accept(v: IRecordVisitor): Result<void, string> {
    v.values(this);
    return Ok(undefined);
  }
}
