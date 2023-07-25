import { type Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';

import { CompositeSpecification } from '@datalking/pivot-entity';

import { type FieldValue } from '../../field/index';
import { type Record } from '../record';
import { type IRecordVisitor } from './interface';

export abstract class BaseRecordSpecification<
  V extends FieldValue,
> extends CompositeSpecification<Record, IRecordVisitor> {
  constructor(
    public readonly fieldId: string,
    public readonly value: V,
  ) {
    super();
  }

  mutate(r: Record): Result<Record, string> {
    r.values.setValue(this.fieldId, this.value);
    return Ok(r);
  }
}

/**
 * Used only for query
 */
export abstract class BaseRecordQuerySpecification<
  T = unknown,
> extends CompositeSpecification<Record, IRecordVisitor> {
  constructor(
    public readonly fieldId: string,
    public readonly value: T,
  ) {
    super();
  }

  mutate(): Result<Record, string> {
    throw new Error('record value specification used only for query.js');
  }
}
